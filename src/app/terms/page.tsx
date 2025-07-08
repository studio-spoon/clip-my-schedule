import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* ヘッダー */}
        <div className='mb-8'>
          <Link
            href='/app'
            className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            アプリに戻る
          </Link>

          <div className='flex items-center gap-4 mb-6'>
            <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg'>
              <Calendar className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                利用規約
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                Time Clipper Terms of Service
              </p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 prose max-w-none'>
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-8'>
            最終更新日: 2025年7月5日
          </p>

          <h2>第1条（適用）</h2>
          <p>
            本利用規約（以下「本規約」といいます）は、STUDIO
            SPOON（以下「当社」といいます）が提供するスケジュール調整サービス「Time
            Clipper」（以下「本サービス」といいます）の利用条件を定めるものです。登録ユーザーの皆さま（以下「ユーザー」といいます）には、本規約に従って本サービスをご利用いただきます。
          </p>

          <h2>第2条（利用登録）</h2>
          <p>
            本サービスにおいて、登録希望者がGoogleアカウントによる認証を行い、当社が認証を承認することによって、利用登録が完了するものとします。
          </p>

          <h2>第3条（サービス内容）</h2>
          <p>本サービスは、以下の機能を提供します：</p>
          <ul>
            <li>Googleカレンダーとの連携によるスケジュール情報の取得</li>
            <li>複数参加者の空き時間検索</li>
            <li>スケジュール調整結果の表示・出力</li>
            <li>その他当社が定める機能</li>
          </ul>

          <h2>第4条（利用料金）</h2>
          <p>
            本サービスは無料でご利用いただけます。ただし、将来的に有料機能を追加する場合があります。
          </p>

          <h2>第5条（禁止事項）</h2>
          <p>
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
          </p>
          <ul>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>
              本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為
            </li>
            <li>
              当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
            </li>
            <li>本サービスによって得られた情報を商業的に利用する行為</li>
            <li>当社のサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>

          <h2>第6条（本サービスの提供の停止等）</h2>
          <p>
            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
          </p>
          <ul>
            <li>
              本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
            </li>
            <li>
              地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
            </li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当社が本サービスの提供が困難と判断した場合</li>
          </ul>

          <h2>第7条（免責事項）</h2>
          <p>
            当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。
          </p>

          <h2>第8条（サービス内容の変更等）</h2>
          <p>
            当社は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれに同意するものとします。
          </p>

          <h2>第9条（利用規約の変更）</h2>
          <p>
            当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします：
          </p>
          <ul>
            <li>本規約の変更がユーザーの一般の利益に適合するとき</li>
            <li>
              本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき
            </li>
          </ul>

          <h2>第10条（個人情報の取扱い）</h2>
          <p>
            当社は、本サービスの利用によって取得する個人情報については、当社のプライバシーポリシーに従い適切に取り扱うものとします。
          </p>

          <h2>第11条（準拠法・裁判管轄）</h2>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
          </p>

          <div className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>以上</p>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
