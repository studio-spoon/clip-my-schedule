import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // すべてのパラメータを取得して検査
  const receivedParams = {
    timestamp: new Date().toISOString(),
    url: request.url,
    receivedParameters: {
      // 期間設定
      selectedPeriod: searchParams.get('selectedPeriod'),
      customPeriodStart: searchParams.get('customPeriodStart'),
      customPeriodEnd: searchParams.get('customPeriodEnd'),
      
      // 時間帯設定
      selectedTimeSlot: searchParams.get('selectedTimeSlot'),
      customTimeStart: searchParams.get('customTimeStart'),
      customTimeEnd: searchParams.get('customTimeEnd'),
      
      // 所要時間設定
      meetingDuration: searchParams.get('meetingDuration'),
      customDuration: searchParams.get('customDuration'),
      
      // バッファ時間設定
      bufferTime: searchParams.get('bufferTime'),
      
      // その他
      emails: searchParams.get('emails'),
      timeMin: searchParams.get('timeMin'),
      timeMax: searchParams.get('timeMax'),
    },
    analysis: {
      hasScheduleSettings: false,
      missingSettings: [],
      issuesDetected: []
    }
  }

  // 設定値の分析
  const analysis = receivedParams.analysis
  
  if (!receivedParams.receivedParameters.selectedPeriod) {
    analysis.missingSettings.push('selectedPeriod')
  }
  
  if (!receivedParams.receivedParameters.selectedTimeSlot) {
    analysis.missingSettings.push('selectedTimeSlot')
  }
  
  if (!receivedParams.receivedParameters.meetingDuration) {
    analysis.missingSettings.push('meetingDuration')
  }
  
  if (!receivedParams.receivedParameters.bufferTime) {
    analysis.missingSettings.push('bufferTime')
  }

  // 期間指定の問題検出
  if (receivedParams.receivedParameters.selectedPeriod === '期間を指定') {
    if (!receivedParams.receivedParameters.customPeriodStart || !receivedParams.receivedParameters.customPeriodEnd) {
      analysis.issuesDetected.push('期間を指定が選択されているが、カスタム日付パラメータが送信されていない')
    }
  }
  
  // 時間指定の問題検出
  if (receivedParams.receivedParameters.selectedTimeSlot === '時間指定') {
    if (!receivedParams.receivedParameters.customTimeStart || !receivedParams.receivedParameters.customTimeEnd) {
      analysis.issuesDetected.push('時間指定が選択されているが、カスタム時間パラメータが不完全')
    }
  }
  
  // カスタム時間の問題検出
  if (receivedParams.receivedParameters.meetingDuration === 'カスタム') {
    if (!receivedParams.receivedParameters.customDuration) {
      analysis.issuesDetected.push('カスタム所要時間が選択されているが、customDurationが送信されていない')
    }
  }

  analysis.hasScheduleSettings = analysis.missingSettings.length === 0

  // 設定値がデフォルトから変更されているかチェック
  const settingsEffectiveness = {
    periodSetting: {
      received: receivedParams.receivedParameters.selectedPeriod,
      isDefault: receivedParams.receivedParameters.selectedPeriod === '直近1週間' || !receivedParams.receivedParameters.selectedPeriod,
      effectiveValue: receivedParams.receivedParameters.selectedPeriod || '直近1週間'
    },
    timeSlotSetting: {
      received: receivedParams.receivedParameters.selectedTimeSlot,
      isDefault: receivedParams.receivedParameters.selectedTimeSlot === 'デフォルト' || !receivedParams.receivedParameters.selectedTimeSlot,
      effectiveValue: receivedParams.receivedParameters.selectedTimeSlot || 'デフォルト'
    },
    meetingDurationSetting: {
      received: receivedParams.receivedParameters.meetingDuration,
      isDefault: receivedParams.receivedParameters.meetingDuration === '60分' || !receivedParams.receivedParameters.meetingDuration,
      effectiveValue: receivedParams.receivedParameters.meetingDuration || '60分'
    },
    bufferTimeSetting: {
      received: receivedParams.receivedParameters.bufferTime,
      isDefault: receivedParams.receivedParameters.bufferTime === '0分' || !receivedParams.receivedParameters.bufferTime,
      effectiveValue: receivedParams.receivedParameters.bufferTime || '0分'
    }
  }

  return NextResponse.json({
    ...receivedParams,
    settingsEffectiveness,
    diagnosis: {
      overallStatus: analysis.hasScheduleSettings && analysis.issuesDetected.length === 0 ? 'GOOD' : 'ISSUES_DETECTED',
      summary: `${analysis.missingSettings.length} missing settings, ${analysis.issuesDetected.length} issues detected`,
      recommendations: [
        analysis.missingSettings.length > 0 ? `フロントエンドから以下の設定が送信されていません: ${analysis.missingSettings.join(', ')}` : null,
        analysis.issuesDetected.length > 0 ? `設定の整合性に問題があります` : null,
        '期間を指定のUIが実装されていない可能性があります',
        'useScheduleSearch フックでパラメータが正しく送信されているか確認してください'
      ].filter(Boolean)
    }
  })
}