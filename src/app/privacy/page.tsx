import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* ヘッダー */}
        <div className='mb-8'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            アプリに戻る
          </Link>

          <div className='flex items-center gap-4 mb-6'>
            <div className='p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg'>
              <Shield className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                プライバシーポリシー
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                Time Clipper Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 prose max-w-none'>
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-8'>
            最終更新日: 2025年7月5日
          </p>

          <h2>1. 基本方針</h2>
          <p>
            STUDIO
            SPOON（以下「当社」といいます）は、スケジュール調整サービス「Time
            Clipper」（以下「本サービス」といいます）において、ユーザーの個人情報保護の重要性を認識し、個人情報の保護に関する法律、その他関係法令等を遵守し、適切な取り扱いを実施いたします。
          </p>

          <h2>2. 個人情報の取得</h2>
          <p>
            当社は、本サービスの提供に必要な範囲で、以下の個人情報を取得いたします：
          </p>
          <ul>
            <li>
              Googleアカウント情報（メールアドレス、氏名、プロフィール画像）
            </li>
            <li>Googleカレンダーの予定情報（日時、空き状況のみ）</li>
            <li>本サービスの利用履歴・アクセスログ</li>
            <li>その他本サービスの利用に必要な情報</li>
          </ul>

          <h2>3. 個人情報の利用目的</h2>
          <p>当社は、取得した個人情報を以下の目的で利用いたします：</p>
          <ul>
            <li>本サービスの提供・運営・維持・改善</li>
            <li>ユーザーの認証・識別</li>
            <li>スケジュール調整機能の提供</li>
            <li>サービス利用状況の分析</li>
            <li>ユーザーサポート・問い合わせ対応</li>
            <li>利用規約違反の対応</li>
            <li>
              サービス改善のための統計データ作成（個人を特定できない形式）
            </li>
          </ul>

          <h2>4. 個人情報の第三者提供</h2>
          <p>
            当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません：
          </p>
          <ul>
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合</li>
            <li>
              公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合
            </li>
            <li>
              国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合
            </li>
          </ul>

          <h2>5. 個人情報の管理・保護</h2>
          <p>
            当社は、個人情報の紛失、破壊、改ざん、漏洩等を防止するため、適切なセキュリティ対策を実施いたします：
          </p>
          <ul>
            <li>データの暗号化通信（HTTPS/TLS）</li>
            <li>アクセス制御・認証システムの導入</li>
            <li>定期的なセキュリティ監査の実施</li>
            <li>従業員への個人情報保護教育の徹底</li>
          </ul>

          <h2>6. データの保存期間</h2>
          <p>当社は、個人情報を以下の期間保存いたします：</p>
          <ul>
            <li>アカウント情報：サービス利用中および退会後1年間</li>
            <li>カレンダー情報：一時的な処理のみで永続的な保存は行いません</li>
            <li>アクセスログ：最大6ヶ月間</li>
          </ul>

          <h2>7. Googleサービスとの連携</h2>
          <p>
            本サービスは、Googleのサービスと連携しており、以下の点にご注意ください：
          </p>
          <ul>
            <li>Google OAuth 2.0を使用した認証</li>
            <li>Google Calendar APIを使用したカレンダー情報の読み取り</li>
            <li>Googleのプライバシーポリシーも適用されます</li>
            <li>必要最小限のスコープでのアクセス許可</li>
          </ul>

          <h2>8. Cookie（クッキー）の使用</h2>
          <p>
            本サービスでは、サービスの利便性向上のためCookieを使用しています：
          </p>
          <ul>
            <li>認証状態の維持</li>
            <li>ユーザー設定（テーマ選択等）の保存</li>
            <li>サービス利用状況の分析</li>
          </ul>
          <p>
            ブラウザの設定でCookieを無効にすることも可能ですが、サービスの一部機能が利用できなくなる場合があります。
          </p>

          <h2>9. ユーザーの権利</h2>
          <p>ユーザーは、自身の個人情報について以下の権利を有します：</p>
          <ul>
            <li>個人情報の開示請求</li>
            <li>個人情報の訂正・追加・削除請求</li>
            <li>個人情報の利用停止・消去請求</li>
            <li>アカウントの削除（退会）</li>
          </ul>

          <h2>10. お問い合わせ</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
          </p>
          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
            <p>
              <strong>STUDIO SPOON</strong>
              <br />
              ウェブサイト:{' '}
              <a
                href='https://studio-spoon.co.jp/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline'
              >
                https://studio-spoon.co.jp/
              </a>
            </p>
          </div>

          <h2>11. プライバシーポリシーの変更</h2>
          <p>
            当社は、必要に応じて本プライバシーポリシーを変更する場合があります。重要な変更については、本サービス上で事前に通知いたします。
          </p>

          <div className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>以上</p>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-4'>
              © 2025{' '}
              <a
                href='https://studio-spoon.co.jp/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline'
              >
                STUDIO SPOON
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
