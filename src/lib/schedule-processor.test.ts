
import { processScheduleParams, validateScheduleParams } from './schedule-processor';

describe('schedule-processor', () => {
  describe('processScheduleParams', () => {
    it('should process buffer times correctly', () => {
      const params = {
        selectedPeriod: '直近1週間',
        selectedTimeSlot: 'デフォルト',
        customTimeStart: '',
        customTimeEnd: '',
        meetingDuration: '30分',
        bufferTimeBefore: '15分',
        bufferTimeAfter: '10分',
        customDuration: '',
      };
      const result = processScheduleParams(params);
      expect(result.bufferTimeBefore).toBe(15);
      expect(result.bufferTimeAfter).toBe(10);
      expect(result.totalSlotDuration).toBe(55); // 15 + 30 + 10
    });
  });

  describe('validateScheduleParams', () => {
    it('should validate buffer times correctly', () => {
      const params = {
        selectedPeriod: '直近1週間',
        selectedTimeSlot: 'デフォルト',
        customTimeStart: '',
        customTimeEnd: '',
        meetingDuration: '30分',
        bufferTimeBefore: '-10分',
        bufferTimeAfter: '150分',
        customDuration: '',
      };
      const result = validateScheduleParams(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('前の隙間時間は0以上である必要があります');
      expect(result.warnings).toContain('後の隙間時間が非常に長く設定されています');
    });
  });
});
