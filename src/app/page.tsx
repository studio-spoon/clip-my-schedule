import LandingPage from '@/components/LandingPage';

export const metadata = {
  title: 'Time Clipper - 面倒な日程調整を、一瞬で | スケジュール調整ツール',
  description: 'Time ClipperはGoogleカレンダーと連携し、チーム全員の空き時間を自動で探し出すスケジュール調整ツール。会議の日程調整が90%時短できます。無料プランあり。',
  keywords: [
    '日程調整',
    'スケジュール調整',
    '会議時間',
    'Googleカレンダー',
    'チーム調整',
    '業務効率化',
    '時短ツール',
    'SaaS',
    '無料',
    'プロジェクト管理'
  ],
  openGraph: {
    title: 'Time Clipper - 面倒な日程調整を、一瞬で',
    description: 'Googleカレンダー連携でチーム全員の空き時間を自動検索。90%の時短を実現するスケジュール調整ツール。',
    type: 'website',
    url: 'https://time-clipper.netlify.app',
    images: [
      {
        url: '/og-landing.png',
        width: 1200,
        height: 630,
        alt: 'Time Clipper ランディングページ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Clipper - 面倒な日程調整を、一瞬で',
    description: 'Googleカレンダー連携でチーム全員の空き時間を自動検索。90%の時短を実現。',
    images: ['/og-landing.png'],
  },
};

export default function LandingPageRoute() {
  return <LandingPage />;
}