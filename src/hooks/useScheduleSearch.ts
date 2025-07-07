'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { clearCalendarCacheForEmails } from '@/lib/calendar-cache';
import type { Member } from '@/types/api';

interface ScheduleSearchParams {
  selectedMembers: string[];
  selectedPeriod: string;
  selectedTimeSlot: string;
  customTimeStart: string;
  customTimeEnd: string;
  meetingDuration: string;
  bufferTimeBefore: string;
  bufferTimeAfter: string;
  customDuration: string;
  customPeriodStart: string;
  customPeriodEnd: string;
  teamMembers: Member[];
  forceRefresh?: boolean;
}

interface ScheduleSlot {
  date: string;
  times: string[];
}

export function useScheduleSearch() {
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);


  const searchSchedule = async ({
    selectedMembers,
    selectedPeriod,
    selectedTimeSlot,
    customTimeStart,
    customTimeEnd,
    meetingDuration,
    bufferTimeBefore,
    bufferTimeAfter,
    customDuration,
    customPeriodStart,
    customPeriodEnd,
    teamMembers,
    forceRefresh = false,
  }: ScheduleSearchParams) => {
  
    if (selectedMembers.length === 0) {
      alert('参加者を選択してください。');
      return;
    }

    if (
      selectedPeriod === '期間を指定' &&
      (!customPeriodStart || !customPeriodEnd)
    ) {
      return;
    }

    setIsSearching(true);

    try {
      // 検索期間の計算
      let timeMin: Date | null = new Date();
      let timeMax: Date | null = new Date();

      if (selectedPeriod === '直近1週間') {
        // 当日の開始時刻（00:00）から1週間後まで
        timeMin.setHours(0, 0, 0, 0);
        timeMax.setDate(timeMax.getDate() + 7);
      } else if (selectedPeriod === '直近2週間') {
        // 当日の開始時刻（00:00）から2週間後まで
        timeMin.setHours(0, 0, 0, 0);
        timeMax.setDate(timeMax.getDate() + 14);
      } else if (selectedPeriod === '期間を指定') {
        if (customPeriodStart && customPeriodEnd) {
          timeMin = new Date(customPeriodStart);
          timeMin.setHours(0, 0, 0, 0); // 開始日の始まりから
          timeMax = new Date(customPeriodEnd);
          timeMax.setHours(23, 59, 59, 999); // 終了日の終わりまで
        } else {
          timeMin = null; // 無効な期間
          timeMax = null;
        }
      }

      if (!timeMin || !timeMax) {
        // エラーハンドリングを改善する可能性
        return;
      }

      // 参加者のカレンダーIDを抽出
      const emails = selectedMembers
        .map((memberDisplayName) => {
          const member = teamMembers.find(
            (m) => m.displayName === memberDisplayName
          );
          return member ? member.calendarId : '';
        })
        .filter((email) => email);

      // 強制リフレッシュの場合、関連するキャッシュをクリア
      if (forceRefresh && emails.length > 0) {
        clearCalendarCacheForEmails(emails);
      }

      
      const result = await api.calendar.searchAvailableSlots(
        {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          emails,
        },
        {
          selectedPeriod,
          selectedTimeSlot,
          customTimeStart,
          customTimeEnd,
          meetingDuration,
          bufferTimeBefore,
          bufferTimeAfter,
          customDuration,
          customPeriodStart,
          customPeriodEnd,
        }
      );
      

      if (result.success && result.data) {
        
        // 🐛 DEBUG: 日別比較でのデバッグ出力
        console.log('\n🔍 DEBUG: Day-by-Day Comparison');
        console.log('🎛️ Applied Filters:', result.data.filters);
        console.log('📅 Time Range:', result.data.timeRange);
        
        // フィルター条件の詳細表示
        const filters = result.data?.filters;
        if (filters) {
          console.log('\n🧮 Filter Calculation Details:');
          console.log(`   Meeting Duration: ${filters.meetingDuration} (type: ${typeof filters.meetingDuration})`);
          console.log(`   Buffer Before: ${filters.bufferBefore} (type: ${typeof filters.bufferBefore})`);
          console.log(`   Buffer After: ${filters.bufferAfter} (type: ${typeof filters.bufferAfter})`);
          
          try {
            if (filters.meetingDuration && filters.bufferBefore && filters.bufferAfter) {
              // 安全な文字列変換と数値抽出
              const meetingMins = typeof filters.meetingDuration === 'string' 
                ? parseInt(filters.meetingDuration.replace('分', ''))
                : parseInt(String(filters.meetingDuration));
              const bufferBeforeMins = typeof filters.bufferBefore === 'string' 
                ? parseInt(filters.bufferBefore.replace('分', ''))
                : parseInt(String(filters.bufferBefore));
              const bufferAfterMins = typeof filters.bufferAfter === 'string' 
                ? parseInt(filters.bufferAfter.replace('分', ''))
                : parseInt(String(filters.bufferAfter));
              
              const totalNeeded = meetingMins + bufferBeforeMins + bufferAfterMins;
              console.log(`   Total Time Needed: ${totalNeeded} minutes (${meetingMins} + ${bufferBeforeMins} + ${bufferAfterMins})`);
            }
          } catch (error) {
            console.error('   ❌ Error calculating filter details:', error);
          }
        }
        
        // 日付リストを作成（availableTimesまたはfreeSlots、busyTimesから）
        const allDates = new Set();
        if (result.data.availableTimes) {
          result.data.availableTimes.forEach(slot => allDates.add(slot.date));
        }
        if (result.data.freeSlots) {
          result.data.freeSlots.forEach(slot => allDates.add(slot.date));
        }
        
        // Busy Timesを日付別に整理
        const busyByDate = new Map<string, Array<{email: string, start: string, end: string, fullStart: string, fullEnd: string}>>();
        if (result.data?.busyTimes) {
          result.data.busyTimes.forEach(bt => {
            bt.busy.forEach(period => {
              const start = new Date(period.start);
              const end = new Date(period.end);
              const dateKey = start.toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'numeric', 
                day: 'numeric', 
                weekday: 'short' 
              });
              
              if (!busyByDate.has(dateKey)) {
                busyByDate.set(dateKey, []);
              }
              busyByDate.get(dateKey)?.push({
                email: bt.email,
                start: start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                end: end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                fullStart: start.toLocaleString('ja-JP'),
                fullEnd: end.toLocaleString('ja-JP')
              });
            });
          });
        }
        
        // 日付毎に3つの情報を並べて表示
        const sortedDates = Array.from(allDates).sort() as string[];
        sortedDates.forEach((date, index) => {
          console.log(`\n📅 === Day ${index + 1}: ${date} ===`);
          
          // 1. Busy Times for this date
          console.log('📊 Busy Times:');
          if (busyByDate.has(date)) {
            const busyForDate = busyByDate.get(date);
            busyForDate?.forEach((busy, busyIndex) => {
              console.log(`   🔒 ${busyIndex + 1}. ${busy.email}: ${busy.start}-${busy.end}`);
            });
          } else {
            console.log('   📗 No busy times');
          }
          
          // 2. Available Times (Raw) for this date
          console.log('📗 Available Times (Raw):');
          const availableForDate = result.data?.availableTimes?.find(slot => slot.date === date);
          if (availableForDate && availableForDate.times.length > 0) {
            availableForDate.times.forEach((timeSlot, timeIndex) => {
              console.log(`   ⏰ ${timeIndex + 1}. ${timeSlot}`);
            });
          } else {
            console.log('   ❌ No available times');
          }
          
          // 3. Filtered Meeting Slots for this date
          console.log('🎯 Filtered Meeting Slots:');
          const filteredForDate = result.data?.freeSlots?.find(slot => slot.date === date);
          if (filteredForDate && filteredForDate.times.length > 0) {
            filteredForDate.times.forEach((timeSlot, timeIndex) => {
              console.log(`   🎯 ${timeIndex + 1}. ${timeSlot}`);
            });
          } else {
            console.log('   ❌ No meeting slots');
          }
        });
        
        // APIレスポンスを既存の形式に変換
        const formattedSlots = result.data.freeSlots.map((daySlot) => ({
          date: daySlot.date,
          times: daySlot.times,
        }));

        setAvailableSlots(formattedSlots);
        setHasSearched(true);
      } else {
        throw new Error(result.error || 'カレンダー情報の取得に失敗しました');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラーが発生しました。';
      
      
      alert(`カレンダー情報の取得に失敗しました: ${errorMessage}\n\n設定や認証を確認してください。`);
      
      // エラー時は空の結果を設定（サンプルデータは使わない）
      setAvailableSlots([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setAvailableSlots([]);
    setHasSearched(false);
  };

  return {
    availableSlots,
    isSearching,
    hasSearched,
    searchSchedule,
    clearResults,
  };
}
