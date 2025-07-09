import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Time Clipper - スケジュール調整を簡単に | 会議時間の空き時間検索ツール',
  description:
    'Time Clipperは、Googleカレンダー連携でチームの空き時間を瞬時に検索できるスケジュール調整ツールです。会議設定、打ち合わせ調整、イベント企画を効率化。無料でご利用いただけます。',
  keywords: [
    'スケジュール調整',
    '会議時間',
    '空き時間検索',
    'Googleカレンダー',
    'チーム調整',
    '打ち合わせ',
    'イベント企画',
    '会議設定',
    'カレンダー連携',
    'スケジュール管理'
  ],
  authors: [{ name: 'STUDIO SPOON', url: 'https://studio-spoon.co.jp/' }],
  creator: 'STUDIO SPOON',
  publisher: 'STUDIO SPOON',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://time-clipper.netlify.app'),
  alternates: {
    canonical: 'https://time-clipper.netlify.app',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://time-clipper.netlify.app',
    title: 'Time Clipper - スケジュール調整を簡単に',
    description: 'Googleカレンダー連携で自分とチームの空き時間をサッと把握。メールやりとりにおける会議設定に活用できるプレーンテキストコピーで、打ち合わせ調整を効率化するWEBアプリです。',
    siteName: 'Time Clipper',
    images: [
      {
        url: '/ogimg.webp',
        width: 1200,
        height: 630,
        alt: 'Time Clipper - スケジュール調整ツール',
      },
    ],
  },
  other: {
    'og:image': '/ogimg.webp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Clipper - スケジュール調整を簡単に',
    description: 'Googleカレンダー連携でチームの空き時間を瞬時に検索。会議設定を効率化。',
    images: ['/ogimg.webp'],
    creator: '@studiospoon',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja'>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Time Clipper',
              url: 'https://time-clipper.netlify.app',
              description: 'Googleカレンダー連携でチームの空き時間を瞬時に検索できるスケジュール調整ツール',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'JPY',
              },
              publisher: {
                '@type': 'Organization',
                name: 'STUDIO SPOON',
                url: 'https://studio-spoon.co.jp/',
              },
              featureList: [
                'Googleカレンダー連携',
                'チーム空き時間検索',
                'スケジュール調整',
                '会議時間設定',
                'イベント企画サポート'
              ],
              screenshot: 'https://time-clipper.netlify.app/ogimg.webp',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '150',
              },
            }),
          }}
        />
      </head>
      <body className='antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
