import Scheduler from '@/components/Scheduler';

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">Time Clipper - スケジュール調整ツール</h1>
      <section aria-label="スケジュール調整アプリケーション">
        <div className="sr-only">
          <h2>Time Clipperの主な機能</h2>
          <ul>
            <li>Googleカレンダー連携による空き時間検索</li>
            <li>チームメンバーの会議時間調整</li>
            <li>打ち合わせ日程の自動提案</li>
            <li>スケジュール調整の効率化</li>
            <li>イベント企画のサポート</li>
          </ul>
        </div>
        <Scheduler />
      </section>
    </main>
  );
}