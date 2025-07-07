'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Member } from '@/types/api';

interface DurationSlot {
  date: string;
  times: string[];
  debug?: {
    slotDetails?: Array<{
      time: string;
      duration: number;
      bufferBefore: number;
      bufferAfter: number;
      slotStart: string;
      slotEnd: string;
      totalDuration: number;
    }>;
  };
}

interface UseDurationSlotsParams {
  selectedMembers: string[];
  teamMembers: Member[];
  selectedPeriod: string;
  customPeriodStart: string;
  customPeriodEnd: string;
  selectedTimeSlot: string;
  customTimeStart: string;
  customTimeEnd: string;
  meetingDuration: string;
  customDuration: string;
}

export function useDurationSlots({
  selectedMembers,
  teamMembers,
  selectedPeriod,
  customPeriodStart,
  customPeriodEnd,
  selectedTimeSlot,
  customTimeStart,
  customTimeEnd,
  meetingDuration,
  customDuration,
}: UseDurationSlotsParams) {
  const [durationSlots, setDurationSlots] = useState<DurationSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMembers.length === 0) {
      setDurationSlots([]);
      return;
    }

    const fetchDurationSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 期間の計算（他のhookと同じロジック）
        let timeMin: Date;
        let timeMax: Date;

        if (selectedPeriod === '直近1週間') {
          timeMin = new Date();
          timeMax = new Date();
          timeMax.setDate(timeMax.getDate() + 7);
        } else if (selectedPeriod === '直近2週間') {
          timeMin = new Date();
          timeMax = new Date();
          timeMax.setDate(timeMax.getDate() + 14);
        } else if (selectedPeriod === '期間を指定') {
          if (!customPeriodStart || !customPeriodEnd) {
            setDurationSlots([]);
            setIsLoading(false);
            return;
          }
          timeMin = new Date(customPeriodStart);
          timeMax = new Date(customPeriodEnd);
          timeMax.setHours(23, 59, 59, 999); // 終了日の終わりまで
        } else {
          // デフォルトは直近1週間
          timeMin = new Date();
          timeMax = new Date();
          timeMax.setDate(timeMax.getDate() + 7);
        }

        // 時間帯の処理
        let workingTimeStart = '10:00';
        let workingTimeEnd = '18:00';

        if (selectedTimeSlot === 'デフォルト') {
          workingTimeStart = '10:00';
          workingTimeEnd = '17:00';
        } else if (selectedTimeSlot === '時間指定') {
          workingTimeStart = customTimeStart || '10:00';
          workingTimeEnd = customTimeEnd || '18:00';
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


        // Calendar APIを呼び出し（期間・時間帯・所要時間を反映、前後余白は0分）
        const result = await api.calendar.searchAvailableSlots(
          {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            emails,
          },
          {
            selectedPeriod,
            selectedTimeSlot,
            customTimeStart: workingTimeStart,
            customTimeEnd: workingTimeEnd,
            meetingDuration,
            bufferTimeBefore: '0分', // 前後余白は含めない
            bufferTimeAfter: '0分', // 前後余白は含めない
            customDuration,
            customPeriodStart,
            customPeriodEnd,
          }
        );

        if (result.success && result.data) {
          // APIレスポンスを変換
          const slots = result.data.freeSlots.map((daySlot) => ({
            date: daySlot.date,
            times: daySlot.times,
            debug: daySlot.debug,
          }));

          setDurationSlots(slots);
        } else {
          throw new Error(result.error || 'カレンダー情報の取得に失敗しました');
        }
      } catch (error) {
        console.error('Duration slots fetch error:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : '不明なエラーが発生しました。';
        setError(errorMessage);
        setDurationSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    // デバウンス処理（300ms）
    const timeoutId = setTimeout(() => {
      fetchDurationSlots();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    selectedMembers,
    teamMembers,
    selectedPeriod,
    customPeriodStart,
    customPeriodEnd,
    selectedTimeSlot,
    customTimeStart,
    customTimeEnd,
    meetingDuration,
    customDuration,
  ]);

  return {
    durationSlots,
    isLoading,
    error,
  };
}
