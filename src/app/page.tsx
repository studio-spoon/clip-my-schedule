import LandingPage from '@/components/LandingPage';

export const metadata = {
  title: 'Time Clipper - 日程調整を、一瞬で | スケジュール調整ツール',
  description: 'Googleカレンダー連携で自分とチームの空き時間をサッと出力。会議設定に活用できるプレーンテキストコピーで、打ち合わせ調整を効率化するWEBアプリ。',
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
    title: 'Time Clipper - 日程調整を、一瞬で',
    description: 'Googleカレンダー連携で自分とチームの空き時間をサッと出力。会議設定に活用できるプレーンテキストコピーで、打ち合わせ調整を効率化するWEBアプリ。',
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
    title: 'Time Clipper - 日程調整を、一瞬で',
    description: 'Googleカレンダー連携で自分とチームの空き時間をサッと出力。会議設定に活用できるプレーンテキストコピーで、打ち合わせ調整を効率化するWEBアプリ。',
    images: ['/og-landing.png'],
  },
};

export default function LandingPageRoute() {
  return <LandingPage />;
}