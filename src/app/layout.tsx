import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Time Clipper',
  description:
    '『Time Clipper』はGoogleカレンダーの空き時間候補をリストアップしてくれるアプリです。自分自身のみならず、チームメンバーの空き時間を素早く検索・共有し、効率的な会議設定をサポートします。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja'>
      <body className='antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
