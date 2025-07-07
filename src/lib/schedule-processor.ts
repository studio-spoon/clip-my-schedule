// Schedule parameter processing and validation

export interface ScheduleParams {
  selectedPeriod: string;
  selectedTimeSlot: string;
  customTimeStart: string;
  customTimeEnd: string;
  meetingDuration: string;
  bufferTimeBefore: string;
  bufferTimeAfter: string;
  customDuration: string;
  customPeriodStart?: string;
  customPeriodEnd?: string;
}

export interface ProcessedScheduleParams {
  timeRange: {
    start: Date;
    end: Date;
  };
  workingHours: {
    start: number;
    end: number;
  };
  meetingDuration: number; // in minutes
  bufferTimeBefore: number; // in minutes
  bufferTimeAfter: number; // in minutes
  totalSlotDuration: number; // meeting + buffer time
}

export function processScheduleParams(
  params: ScheduleParams
): ProcessedScheduleParams {

  // 1. Process time period
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (params.selectedPeriod) {
    case '直近1週間':
      // 当日の00:00から1週間後まで
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 7);
      break;
    case '直近2週間':
      // 当日の00:00から2週間後まで
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 14);
      break;
    case '期間を指定':
      if (params.customPeriodStart && params.customPeriodEnd) {
        try {
          startDate = new Date(params.customPeriodStart);
          startDate.setHours(0, 0, 0, 0); // 開始日の00:00から
          endDate = new Date(params.customPeriodEnd);
          endDate.setHours(23, 59, 59, 999); // 終了日の23:59まで

          if (startDate > endDate) {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setDate(endDate.getDate() + 14);
          }
        } catch (error) {
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() + 14);
        }
      } else {
        // Fallback if custom dates are not provided
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() + 14);
      }
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 14);
  }

  // 🐛 DEBUG: 時間範囲処理の確認
  console.log('🔧 DEBUG: Schedule processor time range');
  console.log('   Current time:', now.toLocaleString('ja-JP'));
  console.log('   Selected period:', params.selectedPeriod);
  console.log('   Processed start:', startDate.toLocaleString('ja-JP'), '(ISO:', startDate.toISOString(), ')');
  console.log('   Processed end:', endDate.toLocaleString('ja-JP'), '(ISO:', endDate.toISOString(), ')');
  
  // 当日の00:00から開始されているかチェック
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  if (startDate.getTime() === todayMidnight.getTime()) {
    console.log('✅ Start time correctly set to today midnight');
  } else if (startDate.getTime() <= todayMidnight.getTime()) {
    console.log('✅ Start time is before or at today midnight (custom period)');
  } else {
    console.log('⚠️ Start time is after today midnight - may miss past events');
  }

  // 2. Process working hours
  let workStart = 9; // Default 9:00
  let workEnd = 18; // Default 18:00

  // 🐛 DEBUG: 時間帯設定の確認
  console.log('🔧 DEBUG: Schedule processor working hours');
  console.log('   Selected time slot:', params.selectedTimeSlot);
  console.log('   Custom time start:', params.customTimeStart);
  console.log('   Custom time end:', params.customTimeEnd);

  switch (params.selectedTimeSlot) {
    case '午前':
      workStart = 9;
      workEnd = 12;
      break;
    case '午後':
      workStart = 13;
      workEnd = 17;
      break;
    case '夜間':
      workStart = 18;
      workEnd = 22;
      break;
    case '時間指定':
      if (params.customTimeStart && params.customTimeEnd) {
        try {
          // 時間と分を含めた処理
          const [startHour, startMin] = params.customTimeStart
            .split(':')
            .map(Number);
          const [endHour, endMin] = params.customTimeEnd.split(':').map(Number);

          // 分単位で変換して比較
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          if (
            startHour < 0 ||
            startHour > 23 ||
            endHour < 0 ||
            endHour > 23 ||
            startMin < 0 ||
            startMin > 59 ||
            endMin < 0 ||
            endMin > 59 ||
            startMinutes >= endMinutes
          ) {
            workStart = 10;
            workEnd = 17;
          } else {
            // 時間部分のみを使用（既存の仕様に合わせる）
            workStart = startHour;
            workEnd = endHour;
          }
        } catch (error) {
          workStart = 10;
          workEnd = 17;
        }
      } else {
        // Fallback for '時間指定' if custom times are not provided
        workStart = 9;
        workEnd = 18;
      }
      break;
    case 'デフォルト': // Fallthrough to default if 'デフォルト' is explicitly selected
    default:
      workStart = 9;
      workEnd = 18;
      break;
  }

  // 🐛 DEBUG: 処理後のワーキングアワー
  console.log('   Final working hours:', `${workStart}:00-${workEnd}:00`);

  // 3. Process meeting duration
  let meetingDuration = 60; // Default 60 minutes

  if (params.meetingDuration && params.meetingDuration !== 'カスタム') {
    try {
      meetingDuration = parseInt(params.meetingDuration.replace('分', ''));
    } catch (error) {
    }
  } else if (params.customDuration) {
    try {
      meetingDuration = parseInt(params.customDuration);
    } catch (error) {
    }
  }

  // 4. Process buffer time
  let bufferTimeBefore = 0; // Default 0 minutes
  let bufferTimeAfter = 0; // Default 0 minutes

  if (params.bufferTimeBefore) {
    try {
      bufferTimeBefore = parseInt(params.bufferTimeBefore.replace('分', ''));
    } catch (error) {
    }
  }
  if (params.bufferTimeAfter) {
    try {
      bufferTimeAfter = parseInt(params.bufferTimeAfter.replace('分', ''));
    } catch (error) {
    }
  }

  const processed: ProcessedScheduleParams = {
    timeRange: {
      start: startDate,
      end: endDate,
    },
    workingHours: {
      start: workStart,
      end: workEnd,
    },
    meetingDuration,
    bufferTimeBefore,
    bufferTimeAfter,
    totalSlotDuration: bufferTimeBefore + meetingDuration + bufferTimeAfter,
  };


  return processed;
}

export function validateScheduleParams(params: ScheduleParams): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate period selection
  if (params.selectedPeriod === '期間を指定') {
    if (!params.customPeriodStart || !params.customPeriodEnd) {
      errors.push('カスタム期間が指定されていません');
    } else {
      try {
        const start = new Date(params.customPeriodStart);
        const end = new Date(params.customPeriodEnd);
        if (start > end) {
          errors.push('開始日は終了日より前である必要があります');
        }
      } catch (error) {
        errors.push('期間の形式が無効です');
      }
    }
  }

  // Validate time slot selection
  if (params.selectedTimeSlot === '時間指定') {
    if (!params.customTimeStart || !params.customTimeEnd) {
      errors.push('カスタム時間が指定されていません');
    } else {
      try {
        // 時間と分を含めた正確な比較
        const [startHour, startMin] = params.customTimeStart
          .split(':')
          .map(Number);
        const [endHour, endMin] = params.customTimeEnd.split(':').map(Number);

        // 分単位で変換して比較
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (startMinutes >= endMinutes) {
          errors.push('開始時間は終了時間より前である必要があります');
        }

        // 最低15分の作業時間を推奨
        if (endMinutes - startMinutes < 15) {
          warnings.push('作業時間が短すぎる可能性があります（最低15分を推奨）');
        }
      } catch (error) {
        errors.push('時間形式が無効です');
      }
    }
  }

  // Validate meeting duration
  if (params.meetingDuration === 'カスタム' && params.customDuration) {
    try {
      const duration = parseInt(params.customDuration);
      if (duration <= 0) {
        errors.push('会議時間は0より大きい必要があります');
      }
      if (duration > 480) {
        // 8 hours
        warnings.push('会議時間が非常に長く設定されています');
      }
    } catch (error) {
      errors.push('カスタム会議時間の形式が無効です');
    }
  }

  // Validate buffer time
  if (params.bufferTimeBefore) {
    try {
      const buffer = parseInt(params.bufferTimeBefore.replace('分', ''));
      if (buffer < 0) {
        errors.push('前の前後余白は0以上である必要があります');
      }
      if (buffer > 120) {
        // 2 hours
        warnings.push('前の前後余白が非常に長く設定されています');
      }
    } catch (error) {
      errors.push('前の前後余白の形式が無効です');
    }
  }
  if (params.bufferTimeAfter) {
    try {
      const buffer = parseInt(params.bufferTimeAfter.replace('分', ''));
      if (buffer < 0) {
        errors.push('後の前後余白は0以上である必要があります');
      }
      if (buffer > 120) {
        // 2 hours
        warnings.push('後の前後余白が非常に長く設定されています');
      }
    } catch (error) {
      errors.push('後の前後余白の形式が無効です');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
