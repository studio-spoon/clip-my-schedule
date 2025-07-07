import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {
  getCachedCalendarData,
  setCachedCalendarData,
  getCacheStats,
} from '@/lib/calendar-cache';
import {
  processScheduleParams,
  validateScheduleParams,
  type ScheduleParams,
  type ProcessedScheduleParams,
} from '@/lib/schedule-processor';

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session: Session | null = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // Check for token refresh errors
    if (session.error === 'RefreshAccessTokenError') {
      return NextResponse.json(
        { error: '認証トークンの更新に失敗しました。再ログインが必要です。' },
        { status: 401 }
      );
    }


    // Google Calendar API設定
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url);
    const emails = searchParams.get('emails')?.split(',') || [
      session.user.email,
    ];

    // スケジュールパラメータの取得
    const scheduleParams: ScheduleParams = {
      selectedPeriod: searchParams.get('selectedPeriod') || '直近1週間',
      selectedTimeSlot: searchParams.get('selectedTimeSlot') || 'デフォルト',
      customTimeStart: searchParams.get('customTimeStart') || '',
      customTimeEnd: searchParams.get('customTimeEnd') || '',
      meetingDuration: searchParams.get('meetingDuration') || '60分',
      bufferTimeBefore: searchParams.get('bufferTimeBefore') || '0分',
      bufferTimeAfter: searchParams.get('bufferTimeAfter') || '0分',
      customDuration: searchParams.get('customDuration') || '',
      customPeriodStart: searchParams.get('customPeriodStart') || undefined,
      customPeriodEnd: searchParams.get('customPeriodEnd') || undefined,
    };

    // パラメータ検証
    const validation = validateScheduleParams(scheduleParams);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `パラメータエラー: ${validation.errors.join(', ')}`,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // パラメータ処理
    const processedParams = processScheduleParams(scheduleParams);
    const timeMin = processedParams.timeRange.start.toISOString();
    const timeMax = processedParams.timeRange.end.toISOString();



    // 複数のカレンダーから空き時間を取得
    const busyTimesPromises = emails.map(async (email) => {
      try {
        // キャッシュをチェック
        const cachedData = getCachedCalendarData(email, timeMin, timeMax);
        if (cachedData) {
          return {
            email,
            busy: cachedData.busyPeriods,
            source: 'cache',
            cachedAt: new Date(cachedData.cachedAt).toISOString(),
          };
        }


        // Events APIを使用して出席状況を含む詳細情報を取得
        const response = await calendar.events.list({
          calendarId: email,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const events = response.data.items || [];

        // 出席状況をチェックしてbusyを決定
        const processedBusy = events
          .filter((event: any) => {
            // 終日イベントまたは時間が不明なイベントをスキップ
            if (!event.start?.dateTime || !event.end?.dateTime) {
              return false;
            }

            // 出席状況をチェック
            const attendees = event.attendees || [];
            const userAttendance = attendees.find((attendee: any) => 
              attendee.email === email
            );

            // 出席者リストにない場合（自分が主催者の場合など）は busy とみなす
            if (!userAttendance) {
              return true;
            }

            const responseStatus = userAttendance.responseStatus;

            // 出席が「いいえ」(declined) の場合は busy から除外
            if (responseStatus === 'declined') {
              return false;
            }

            // accepted, tentative, needsAction の場合は busy とみなす
            return true;
          })
          .map((event: any) => ({
            start: event.start.dateTime,
            end: event.end.dateTime,
            summary: event.summary,
            responseStatus: event.attendees?.find((a: any) => a.email === email)?.responseStatus || 'organizer',
          }));

        
        const calendarErrors: any[] = []; // Events APIではエラーフォーマットが異なる

        // キャッシュに保存
        setCachedCalendarData(email, timeMin, timeMax, processedBusy);


        return {
          email,
          busy: processedBusy,
          errors: calendarErrors,
          source: 'api',
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(`Error fetching calendar for ${email}:`, error);


        return {
          email,
          busy: [],
          error:
            error.response?.status === 401
              ? 'Authentication error - token may be expired'
              : 'カレンダーアクセスエラー',
        };
      }
    });

    const busyTimes = await Promise.all(busyTimesPromises);

    // 🐛 DEBUG: カレンダーデータの詳細出力
    console.log('🔍 DEBUG: Calendar API Results');
    console.log('📅 Time Range:', { timeMin, timeMax });
    console.log('🕒 Time Range (human readable):');
    console.log('   From:', new Date(timeMin).toLocaleString('ja-JP'));
    console.log('   To:', new Date(timeMax).toLocaleString('ja-JP'));
    console.log('🕒 Current server time:', new Date().toLocaleString('ja-JP'));
    
    // 当日の過去イベントが含まれるかチェック
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const queryStartTime = new Date(timeMin);
    
    if (queryStartTime.getTime() <= startOfToday.getTime()) {
      console.log('✅ Query includes today from midnight (will capture past events)');
    } else if (queryStartTime.getTime() <= now.getTime()) {
      console.log('⚠️ Query starts from current time (may miss some past events today)');
    } else {
      console.log('⚠️ Query starts in the future (will miss current day events)');
    }
    
    console.log('👥 Requested emails:', emails);
    console.log('📊 Busy times summary:');
    busyTimes.forEach((bt, index) => {
      console.log(`  ${index + 1}. ${bt.email}`);
      console.log(`     Busy periods: ${bt.busy.length}`);
      if (bt.busy.length > 0) {
        bt.busy.forEach((period, pIndex) => {
          const start = new Date(period.start);
          const end = new Date(period.end);
          console.log(`       ${pIndex + 1}. ${start.toLocaleString('ja-JP')} - ${end.toLocaleString('ja-JP')}`);
        });
      } else {
        console.log('       📗 Completely free!');
      }
    });

    // エラーチェック
    const firstError = busyTimes.find((bt) => bt.error);
    if (firstError) {
      return NextResponse.json(
        {
          success: false,
          error: `カレンダー「${firstError.email}」の取得に失敗しました: ${firstError.error}`,
          errorDetails: busyTimes.filter((bt) => bt.error),
        },
        { status: 502 }
      ); // Bad Gateway
    }

    // Step 1: 素の空き時間を取得（開催時期のみ考慮）
    const availableTimes = calculateSimpleFreeSlots(busyTimes, timeMin, timeMax);
    
    // 🐛 DEBUG: Available Times（素の空き時間）の日別出力
    console.log('\n📗 DEBUG: Available Times (Raw free slots by day)');
    if (availableTimes.length === 0) {
      console.log('   ❌ No available times found');
    } else {
      availableTimes.forEach((daySlot, index) => {
        console.log(`   📅 Day ${index + 1}: ${daySlot.date}`);
        if (daySlot.times.length === 0) {
          console.log('      ❌ No free slots');
        } else {
          daySlot.times.forEach((timeSlot, timeIndex) => {
            console.log(`      ⏰ ${timeIndex + 1}. ${timeSlot}`);
          });
        }
      });
    }
    
    // Step 2: パラメータに基づいてフィルタリング
    const filteredSlots = applyFilters(availableTimes, processedParams);
    
    // 🐛 DEBUG: Filtered Slots（フィルタリング後）の日別出力
    console.log('\n🎯 DEBUG: Filtered Meeting Slots (After applying filters)');
    if (filteredSlots.length === 0) {
      console.log('   ❌ No meeting slots after filtering');
    } else {
      filteredSlots.forEach((daySlot, index) => {
        console.log(`   📅 Day ${index + 1}: ${daySlot.date}`);
        if (daySlot.times.length === 0) {
          console.log('      ❌ No meeting slots');
        } else {
          daySlot.times.forEach((timeSlot, timeIndex) => {
            console.log(`      🎯 ${timeIndex + 1}. ${timeSlot}`);
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        freeSlots: filteredSlots,
        availableTimes, // デバッグ用：素の空き時間
        busyTimes,
        timeRange: { timeMin, timeMax },
        participants: emails,
        filters: {
          timeSlot: scheduleParams.selectedTimeSlot,
          meetingDuration: processedParams.meetingDuration,
          bufferBefore: processedParams.bufferTimeBefore,
          bufferAfter: processedParams.bufferTimeAfter,
        },
      },
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'カレンダー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 空き時間計算関数
function calculateFreeSlots(
  busyTimes: Array<{
    email: string;
    busy: Array<{ start: string; end: string }>;
  }>,
  params: ProcessedScheduleParams
) {
  const slots = [];
  const start = params.timeRange.start;
  const end = params.timeRange.end;
  const workingHours = params.workingHours;
  const meetingDuration = params.meetingDuration;
  const bufferTimeBefore = params.bufferTimeBefore;
  const bufferTimeAfter = params.bufferTimeAfter;
  const totalSlotMinutes = params.totalSlotDuration;


  for (
    let date = new Date(start);
    date < end;
    date.setDate(date.getDate() + 1)
  ) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }


    // 1. その日の全員のビジー時間を統合
    const dayBusyPeriods = [];
    for (const { email, busy } of busyTimes) {
      for (const { start: busyStart, end: busyEnd } of busy) {
        const busyStartTime = new Date(busyStart);
        const busyEndTime = new Date(busyEnd);

        // 同じ日付のビジー時間のみ取得
        if (
          busyStartTime.toDateString() === date.toDateString() ||
          busyEndTime.toDateString() === date.toDateString() ||
          (busyStartTime <= date && busyEndTime >= date)
        ) {
          dayBusyPeriods.push({
            start: busyStartTime,
            end: busyEndTime,
            email,
          });
        }
      }
    }


    // 2. ビジー時間をソートして統合
    const sortedBusyPeriods = dayBusyPeriods.sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    const mergedBusyPeriods = [];

    for (const period of sortedBusyPeriods) {
      if (mergedBusyPeriods.length === 0) {
        mergedBusyPeriods.push(period);
      } else {
        const lastPeriod = mergedBusyPeriods[mergedBusyPeriods.length - 1];
        // 重複または隣接している場合は統合
        if (period.start <= lastPeriod.end) {
          lastPeriod.end = new Date(
            Math.max(lastPeriod.end.getTime(), period.end.getTime())
          );
        } else {
          mergedBusyPeriods.push(period);
        }
      }
    }


    // 3. 空き時間を計算
    const freeSlots = [];

    // その日の開始時刻と終了時刻を設定
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // 作業時間の範囲を設定
    const workStart = new Date(date);
    workStart.setHours(workingHours.start, 0, 0, 0);
    const workEnd = new Date(date);
    workEnd.setHours(workingHours.end, 0, 0, 0);


    // 空き時間の候補を生成
    let currentTime = new Date(
      Math.max(dayStart.getTime(), workStart.getTime())
    );

    for (const busyPeriod of mergedBusyPeriods) {
      // 現在時刻からビジー時間の開始まで空いている場合
      if (currentTime < busyPeriod.start) {
        const freeStart = new Date(currentTime);
        const freeEnd = new Date(busyPeriod.start);

        // 作業時間内の空き時間のみ
        const effectiveFreeStart = new Date(
          Math.max(freeStart.getTime(), workStart.getTime())
        );
        const effectiveFreeEnd = new Date(
          Math.min(freeEnd.getTime(), workEnd.getTime())
        );

        if (effectiveFreeStart < effectiveFreeEnd) {
          freeSlots.push({
            start: effectiveFreeStart,
            end: effectiveFreeEnd,
            durationMinutes:
              (effectiveFreeEnd.getTime() - effectiveFreeStart.getTime()) /
              60000,
          });
        }
      }

      // 次の開始時刻を更新
      currentTime = new Date(
        Math.max(currentTime.getTime(), busyPeriod.end.getTime())
      );
    }

    // 最後のビジー時間から作業終了時刻まで
    if (currentTime < workEnd) {
      const effectiveFreeStart = new Date(
        Math.max(currentTime.getTime(), workStart.getTime())
      );
      const effectiveFreeEnd = new Date(workEnd);

      if (effectiveFreeStart < effectiveFreeEnd) {
        freeSlots.push({
          start: effectiveFreeStart,
          end: effectiveFreeEnd,
          durationMinutes:
            (effectiveFreeEnd.getTime() - effectiveFreeStart.getTime()) / 60000,
        });
      }
    }


    // 4. 会議可能な時間帯を生成
    const daySlots = [];

    for (const freeSlot of freeSlots) {
      // 必要な時間（会議時間 + 前後余白）が確保できるかチェック
      if (freeSlot.durationMinutes >= totalSlotMinutes) {
        // 15分刻みで会議開始時刻の候補を生成
        const slotStartTime = freeSlot.start.getTime();
        const slotEndTime =
          freeSlot.end.getTime() - totalSlotMinutes * 60 * 1000;

        for (
          let time = slotStartTime;
          time <= slotEndTime;
          time += 15 * 60 * 1000
        ) {
          const slotWithBufferStart = new Date(time);
          const meetingStart = new Date(time + bufferTimeBefore * 60 * 1000);
          const meetingEnd = new Date(
            meetingStart.getTime() + meetingDuration * 60 * 1000
          );
          const slotWithBufferEnd = new Date(
            meetingEnd.getTime() + bufferTimeAfter * 60 * 1000
          );

          // ★重要：全体の時間枠（バッファ込み）がビジー時間と重複していないかチェック
          let isOverlapping = false;
          for (const busyPeriod of mergedBusyPeriods) {
            if (
              slotWithBufferStart < busyPeriod.end &&
              slotWithBufferEnd > busyPeriod.start
            ) {
              isOverlapping = true;
              break;
            }
          }

          if (!isOverlapping) {
            daySlots.push({
              start: meetingStart.toISOString(),
              end: meetingEnd.toISOString(),
              time: `${meetingStart.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })} - ${meetingEnd.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              duration: meetingDuration,
              bufferBefore: bufferTimeBefore,
              bufferAfter: bufferTimeAfter,
              debug: {
                freeSlot: `${freeSlot.start.toLocaleTimeString()} - ${freeSlot.end.toLocaleTimeString()}`,
                freeSlotDuration: freeSlot.durationMinutes,
                totalDuration: totalSlotMinutes,
                slotWithBuffer: `${slotWithBufferStart.toLocaleTimeString()} - ${slotWithBufferEnd.toLocaleTimeString()}`,
              },
            });
          }
        }
      }
    }

    if (daySlots.length > 0) {
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      });


      slots.push({
        date: dateStr,
        times: daySlots.map((slot) => slot.time),
        debug: {
          slotDetails: daySlots.map((slot) => ({
            time: slot.time,
            duration: slot.duration,
            bufferBefore: slot.bufferBefore,
            bufferAfter: slot.bufferAfter,
            freeSlot: slot.debug.freeSlot,
            freeSlotDuration: slot.debug.freeSlotDuration,
            totalDuration: slot.debug.totalDuration,
          })),
        },
      });
    }
  }

  // 🐛 DEBUG: 最終的な空き時間スロット
  console.log('🎯 DEBUG: Final Free Slots Result');
  console.log(`📊 Total days with slots: ${slots.length}`);
  slots.forEach((daySlot, index) => {
    console.log(`  ${index + 1}. ${daySlot.date}`);
    console.log(`     Available times: ${daySlot.times.length}`);
    daySlot.times.forEach((time, timeIndex) => {
      console.log(`       ${timeIndex + 1}. ${time}`);
    });
    if (daySlot.times.length === 0) {
      console.log('       🚫 No available meeting times for this day');
    }
  });
  if (slots.length === 0) {
    console.log('❌ No free slots found for any day in the requested period');
  }

  return slots;
}

// シンプルな空き時間計算関数（所要時間や前後時間に左右されない素の空き時間）
function calculateSimpleFreeSlots(
  busyTimes: Array<{
    email: string;
    busy: Array<{ start: string; end: string }>;
  }>,
  timeMin: string,
  timeMax: string
) {
  const slots = [];
  const startDate = new Date(timeMin);
  const endDate = new Date(timeMax);

  // 全ての参加者のビジー時間を統合
  const allBusyPeriods = [];
  for (const { busy } of busyTimes) {
    for (const period of busy) {
      allBusyPeriods.push({
        start: new Date(period.start),
        end: new Date(period.end),
      });
    }
  }

  // ビジー時間をソートして統合
  allBusyPeriods.sort((a, b) => a.start.getTime() - b.start.getTime());
  const mergedBusyPeriods = [];
  
  for (const period of allBusyPeriods) {
    if (mergedBusyPeriods.length === 0) {
      mergedBusyPeriods.push(period);
    } else {
      const lastPeriod = mergedBusyPeriods[mergedBusyPeriods.length - 1];
      if (period.start <= lastPeriod.end) {
        // 重複または隣接している場合は統合
        lastPeriod.end = new Date(Math.max(lastPeriod.end.getTime(), period.end.getTime()));
      } else {
        mergedBusyPeriods.push(period);
      }
    }
  }

  // 日ごとに空き時間を計算
  for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // その日のビジー時間を取得
    const dayBusyPeriods = mergedBusyPeriods.filter(period => {
      return (period.start <= dayEnd && period.end >= dayStart);
    });

    // 空き時間を計算
    const freeSlots = [];
    let currentTime = dayStart;

    for (const busyPeriod of dayBusyPeriods) {
      // 現在時刻からビジー時間の開始まで空いている場合
      if (currentTime < busyPeriod.start) {
        const freeStart = new Date(Math.max(currentTime.getTime(), dayStart.getTime()));
        const freeEnd = new Date(Math.min(busyPeriod.start.getTime(), dayEnd.getTime()));
        
        if (freeStart < freeEnd) {
          freeSlots.push({
            start: freeStart,
            end: freeEnd,
          });
        }
      }
      currentTime = new Date(Math.max(currentTime.getTime(), busyPeriod.end.getTime()));
    }

    // 最後のビジー時間から日の終わりまで
    if (currentTime < dayEnd) {
      freeSlots.push({
        start: currentTime,
        end: dayEnd,
      });
    }

    // 空き時間が存在する場合のみ結果に追加
    if (freeSlots.length > 0) {
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      });

      // 空き時間を連続した時間として表示
      const times = freeSlots.map(slot => {
        const startTime = slot.start.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const endTime = slot.end.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${startTime}-${endTime}`;
      });

      slots.push({
        date: dateStr,
        times: times,
      });
    }
  }

  // 🐛 DEBUG: シンプルな空き時間の出力
  console.log('🎯 DEBUG: Simple Free Slots Result');
  console.log(`📊 Total days with free time: ${slots.length}`);
  slots.forEach((daySlot, index) => {
    console.log(`  ${index + 1}. ${daySlot.date}`);
    console.log(`     Available times: ${daySlot.times.length}`);
    daySlot.times.forEach((time, timeIndex) => {
      console.log(`       ${timeIndex + 1}. ${time}`);
    });
  });
  if (slots.length === 0) {
    console.log('❌ No free time found for any day');
  }

  return slots;
}

// フィルタリング関数：Available timesを段階的に絞り込む
function applyFilters(
  availableTimes: Array<{
    date: string;
    times: string[];
  }>,
  params: ProcessedScheduleParams
) {
  console.log('🔧 DEBUG: Applying filters to available times');
  console.log(`   Input available times: ${availableTimes.length} days`);
  console.log(`   Working hours: ${params.workingHours.start}:00-${params.workingHours.end}:00`);
  console.log(`   Meeting duration: ${params.meetingDuration} minutes`);
  console.log(`   Buffer before: ${params.bufferTimeBefore} minutes`);
  console.log(`   Buffer after: ${params.bufferTimeAfter} minutes`);

  const filteredSlots = [];

  for (const daySlot of availableTimes) {
    console.log(`\n📅 Processing ${daySlot.date}`);
    const dayFilteredTimes = [];

    for (const timeRange of daySlot.times) {
      console.log(`  🔍 Checking time range: ${timeRange}`);
      
      // Step 1: 時間帯フィルタリング（作業時間内かチェック）
      const workingHourFiltered = filterByWorkingHours(timeRange, params.workingHours);
      if (!workingHourFiltered) {
        console.log(`    ❌ Outside working hours`);
        continue;
      }
      console.log(`    ✅ Within working hours: ${workingHourFiltered}`);

      // Step 2: 所要時間＋前後余白で会議可能時間を生成
      const meetingSlots = generateMeetingSlots(
        workingHourFiltered,
        params.meetingDuration,
        params.bufferTimeBefore,
        params.bufferTimeAfter
      );

      if (meetingSlots.length > 0) {
        console.log(`    📋 Generated ${meetingSlots.length} meeting slots`);
        dayFilteredTimes.push(...meetingSlots);
      } else {
        console.log(`    ❌ No meeting slots possible (insufficient time)`);
      }
    }

    if (dayFilteredTimes.length > 0) {
      filteredSlots.push({
        date: daySlot.date,
        times: dayFilteredTimes,
      });
      console.log(`  ✅ Final slots for ${daySlot.date}: ${dayFilteredTimes.length}`);
    } else {
      console.log(`  ❌ No slots available for ${daySlot.date}`);
    }
  }

  console.log(`\n🎯 Final filtered result: ${filteredSlots.length} days with meeting slots`);
  return filteredSlots;
}

// 作業時間内にフィルタリング
function filterByWorkingHours(
  timeRange: string,
  workingHours: { start: number; end: number }
): string | null {
  const [startStr, endStr] = timeRange.split('-');
  const startTime = parseTime(startStr);
  const endTime = parseTime(endStr);

  const workStart = workingHours.start * 60; // 分に変換
  const workEnd = workingHours.end * 60;

  // 作業時間と重複する部分を計算
  const overlapStart = Math.max(startTime, workStart);
  const overlapEnd = Math.min(endTime, workEnd);

  if (overlapStart >= overlapEnd) {
    return null; // 重複なし
  }

  return `${formatTime(overlapStart)}-${formatTime(overlapEnd)}`;
}

// 会議可能時間スロットを生成（前後余白を考慮した実際の会議時間を算出）
function generateMeetingSlots(
  timeRange: string,
  meetingDuration: number,
  bufferBefore: number,
  bufferAfter: number
): string[] {
  const [startStr, endStr] = timeRange.split('-');
  const startTime = parseTime(startStr);
  const endTime = parseTime(endStr);
  
  const totalNeeded = bufferBefore + meetingDuration + bufferAfter;
  const availableTime = endTime - startTime;

  console.log(`    🧮 Time calculation for ${timeRange}:`);
  console.log(`       Available time: ${availableTime} minutes (${startStr} to ${endStr})`);
  console.log(`       Meeting duration: ${meetingDuration} minutes`);
  console.log(`       Buffer before: ${bufferBefore} minutes`);
  console.log(`       Buffer after: ${bufferAfter} minutes`);
  console.log(`       Total needed: ${totalNeeded} minutes`);

  // 必要な時間が確保できない場合は除外
  if (availableTime < totalNeeded) {
    console.log(`       Result: ❌ INSUFFICIENT - need ${totalNeeded} but only have ${availableTime}`);
    return [];
  }

  // 前後余白を考慮した実際の会議可能時間を計算
  const actualMeetingStart = startTime + bufferBefore;
  const actualMeetingEnd = endTime - bufferAfter;
  const actualMeetingTime = actualMeetingEnd - actualMeetingStart;

  console.log(`       Actual meeting window: ${formatTime(actualMeetingStart)}-${formatTime(actualMeetingEnd)} (${actualMeetingTime} minutes)`);

  // 実際の会議時間が所要時間を満たすかチェック
  if (actualMeetingTime < meetingDuration) {
    console.log(`       Result: ❌ INSUFFICIENT - actual meeting window ${actualMeetingTime} < required ${meetingDuration}`);
    return [];
  }

  const adjustedTimeRange = `${formatTime(actualMeetingStart)}-${formatTime(actualMeetingEnd)}`;
  console.log(`       Result: ✅ SUFFICIENT - adjusted time range: ${adjustedTimeRange}`);
  
  return [adjustedTimeRange];
}

// 時間文字列を分に変換（例: "14:30" → 870）
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 分を時間文字列に変換（例: 870 → "14:30"）
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
