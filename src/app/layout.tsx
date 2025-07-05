import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Spoon スケジュール調整",
  description: "Studio Spoonのスケジュール調整アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
