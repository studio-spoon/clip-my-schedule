'use client';

import React from 'react';
import { 
  Clock, 
  Calendar,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Target,
  ChevronDown,
  Mail,
  Building
} from 'lucide-react';
import Link from 'next/link';


function LandingPageContent() {

  return (
    <div className="min-h-screen" style={{background: 'var(--background)', color: 'var(--foreground)'}}>
      {/* ヘッダー */}
      <header className="border-b backdrop-blur-sm sticky top-0 z-50" style={{borderColor: 'var(--border)', backgroundColor: 'var(--card)/95'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{color: 'var(--foreground)'}}>Time Clipper</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="transition-colors" style={{color: 'var(--muted-foreground)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--foreground)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--muted-foreground)'}>機能</a>
              <a href="#pricing" className="transition-colors" style={{color: 'var(--muted-foreground)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--foreground)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--muted-foreground)'}>料金</a>
              <a href="#faq" className="transition-colors" style={{color: 'var(--muted-foreground)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--foreground)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--muted-foreground)'}>FAQ</a>
              <Link 
                href="/app"
                className="px-4 py-2 rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--primary)'}
              >
                アプリを開く
              </Link>
            </nav>
            <button className="md:hidden p-2">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              面倒な日程調整を、
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                一瞬で
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Time ClipperはGoogleカレンダーと連携し、チーム全員の空き時間を自動で探し出す、新しいスケジュール調整ツールです。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/app"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Googleアカウントで無料で試す
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              クレジットカード不要 • 3分で開始 • 無料プランでずっと利用可能
            </p>
          </div>

          {/* デモ画像エリア */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-600">time-clipper.netlify.app</div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">メンバー選択</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">田中太郎（あなた）</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">佐藤花子</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        <span className="text-sm text-gray-500">山田次郎</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">空き時間検索結果</h3>
                    <div className="space-y-2">
                      <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">明日 14:00-15:00</div>
                        <div className="text-sm text-green-600">全員参加可能</div>
                      </div>
                      <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">1/25 10:00-11:00</div>
                        <div className="text-sm text-green-600">全員参加可能</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 課題提起セクション */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              こんな日程調整に、時間を奪われていませんか？
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Mail,
                title: "延々と続くメール",
                description: "候補日時のリストアップと返信待ちの繰り返し"
              },
              {
                icon: Calendar,
                title: "カレンダー地獄",
                description: "複数人のカレンダーを何度も見比べる手間"
              },
              {
                icon: Users,
                title: "調整ミス",
                description: "「言った言わない」の調整ミス"
              },
              {
                icon: Clock,
                title: "時間の無駄",
                description: "急な予定変更による再調整の煩わしさ"
              }
            ].map((problem, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <problem.icon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 解決策セクション */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Time Clipperが、そのすべてを解決します
            </h2>
            <p className="text-xl text-gray-600">
              シンプルな3ステップで、面倒な日程調整が一瞬で完了
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "1",
                title: "連携",
                subtitle: "Connect",
                description: "Googleアカウントでログインするだけ。面倒な初期設定は不要。",
                icon: Shield,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "2", 
                title: "選択",
                subtitle: "Select",
                description: "メンバーと会議時間などの条件を選ぶだけ。",
                icon: Target,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "3",
                title: "発見",
                subtitle: "Find",
                description: "全員の空き時間を即座にリストアップ。",
                icon: Zap,
                color: "from-green-500 to-green-600"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="mb-2">
                  <span className="text-sm text-gray-500 font-medium">STEP {step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {step.title}
                  <span className="text-lg text-gray-500 ml-2">({step.subtitle})</span>
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          {/* 機能リスト */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "複数メンバーの空き時間を一括検索",
                description: "最大15名（Proプラン）のカレンダーから共通の空き時間を瞬時に検索"
              },
              {
                title: "カスタム時間設定で柔軟な調整",
                description: "会議時間、時間帯、バッファ時間を細かく設定可能"
              },
              {
                title: "結果の簡単エクスポート",
                description: "検索結果をテキストでコピーして、そのままメールに貼り付け"
              },
              {
                title: "レスポンシブデザイン",
                description: "PC・スマホ・タブレットどの端末からでも快適に利用可能"
              }
            ].map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ベネフィットセクション */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              あなたのチームに、もっと価値ある時間を
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "会議調整時間が90%削減",
                description: "1時間かかっていた調整が6分で完了",
                stat: "90%",
                unit: "時短"
              },
              {
                icon: Target,
                title: "生産性の高い業務に集中",
                description: "ノンコア業務から解放され、重要な仕事に専念",
                stat: "3x",
                unit: "効率UP"
              },
              {
                icon: Users,
                title: "スムーズな連携でチームワーク向上",
                description: "迅速な日程調整でプロジェクトの始動を加速",
                stat: "100%",
                unit: "満足度"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-gray-900">{benefit.stat}</div>
                  <div className="text-sm text-gray-500 font-medium">{benefit.unit}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              シンプルで明確な料金体系
            </h2>
            <p className="text-xl text-gray-600">
              すべてのプランで14日間の無料トライアル付き
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 無料プラン */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">無料</h3>
                <p className="text-gray-600 mb-4">個人・3名以下のチーム向け</p>
                <div className="text-4xl font-bold text-gray-900">¥0</div>
                <div className="text-gray-500">/ 月</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>登録メンバー数: 3名まで</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>空き時間検索: 月20回まで</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>基本機能すべて</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>メールサポート</span>
                </li>
              </ul>
              <Link
                href="/app"
                className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center block"
              >
                無料で始める
              </Link>
            </div>

            {/* Proプラン */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  おすすめ
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">成長中のチーム向け</p>
                <div className="text-4xl font-bold text-gray-900">¥980</div>
                <div className="text-gray-500">/ 月</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>登録メンバー数: 15名まで</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">空き時間検索: 無制限</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">高度な時間設定</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>優先メールサポート</span>
                </li>
              </ul>
              <Link
                href="/app"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center block"
              >
                14日間無料で試す
              </Link>
            </div>

            {/* Enterpriseプラン */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">大企業・事業部単位向け</p>
                <div className="text-2xl font-bold text-gray-900">お問い合わせ</div>
                <div className="text-gray-500">カスタム価格</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">登録メンバー数: 無制限</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">すべての機能</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">チーム管理機能</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>専任担当者サポート</span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                資料請求・相談
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 信頼性セクション */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              安心・安全にご利用いただけます
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">セキュリティ</h3>
              <p className="text-gray-600">Googleの安全なOAuth認証を利用。カレンダー情報の保存・変更は一切行いません。</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">運営会社</h3>
              <p className="text-gray-600"><a href="https://studio-spoon.co.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">STUDIO SPOON</a> による開発・運営。プライバシーポリシー完備。</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">サポート</h3>
              <p className="text-gray-600">充実したドキュメントとメールサポート。不明な点はお気軽にお問い合わせください。</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ セクション */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              よくある質問
            </h2>
          </div>
          <div className="space-y-8">
            {[
              {
                q: "セキュリティは安全ですか？",
                a: "はい、Time ClipperはGoogleの公式OAuth認証を使用しており、あなたのカレンダー情報を保存したり変更したりすることはありません。アクセス権限は空き時間の読み取りのみに限定されています。"
              },
              {
                q: "Googleカレンダーのどの情報にアクセスしますか？",
                a: "予定の開始・終了時間のみにアクセスします。予定の詳細内容（タイトル、場所、参加者など）は一切取得しません。"
              },
              {
                q: "無料プランでどこまでできますか？",
                a: "無料プランでは3名まで、月20回まで検索が可能です。基本的なスケジュール調整機能はすべて利用できるため、小規模チームなら十分にご活用いただけます。"
              },
              {
                q: "チームメンバーも登録が必要ですか？",
                a: "はい、スケジュールを確認したいメンバー全員の登録が必要です。ただし登録は簡単で、Googleアカウントがあれば1分で完了します。"
              },
              {
                q: "プランはいつでも変更できますか？",
                a: "はい、プランの変更はいつでも可能です。アップグレード・ダウングレードともに月単位で調整でき、日割り計算で課金されます。"
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐ、面倒な日程調整から解放されましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Time Clipperで、あなたのチームの生産性を劇的に向上させてください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/app"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              無料で始める
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-blue-100 mt-4">
            3分で開始 • クレジットカード不要 • いつでもキャンセル可能
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Time Clipper</span>
              </div>
              <p className="text-gray-400">
                面倒な日程調整を一瞬で解決するスケジュール調整ツール
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">プロダクト</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">機能</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">料金</a></li>
                <li><Link href="/app" className="hover:text-white transition-colors">アプリ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('info@studio-spoon.co.jp');
                      // 簡単なフィードバック表示（オプション）
                      const button = document.activeElement as HTMLElement;
                      const originalText = button.textContent;
                      button.textContent = 'コピーしました！';
                      setTimeout(() => {
                        button.textContent = originalText;
                      }, 2000);
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    お問い合わせ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法的事項</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 <a href="https://studio-spoon.co.jp/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">STUDIO SPOON</a>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="light-theme">
      <LandingPageContent />
    </div>
  );
}