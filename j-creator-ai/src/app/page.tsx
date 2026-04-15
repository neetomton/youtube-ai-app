import { Mic, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GeneratedOutputCard } from "@/components/generated-output-card";
import { HistorySection } from "@/components/history-section";
import { SiteHeader } from "@/components/site-header";
import { UploadPanel } from "@/components/upload-panel";

const SAMPLE_TRANSCRIPT = `【サンプル文字起こし】
本日のテーマは「小さく始めるコンテンツマーケティング」です。
最初から完璧を目指すのではなく、まずは週に1本の発信から…`;

const SAMPLE_NOTE = `# 小さく始めるコンテンツマーケティング

## はじめに
コンテンツマーケティングは、最初から完璧を目指すほど継続が難しくなります。本記事では、忙しいクリエイターが続けやすい「小さく始める」ための考え方と、実践ステップを整理します。

## 目次
- まずは週1本から
- プラットフォーム選びの優先順位
- 効果測定の軽量フレーム

## まずは週1本から
"続けられる最小単位"を決めることが最初の仕事です。…`;

const SAMPLE_LINE = `🎙️今日の配信、聴いてくれてありがとう！

今回のテーマは
「小さく始めるコンテンツマーケ📈」

最初から完璧を目指すと続かない…！

まずは週1本から✨
フォーマットは後から整えればOK👌

明日から試せる"最小単位"の話、
ぜひ本編で聴いてみてね🎧
`;

const SAMPLE_X = `最初から完璧を目指すほど、発信は続かない。

まずは "週1本" の最小単位から始めて、
続けられる設計を手に入れよう。

小さく始めるコンテンツマーケのコツを
新しいエピソードで話しました🎧

#コンテンツマーケ #クリエイター`;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5">
                <Sparkles className="size-3" /> Phase 1 Preview
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                音声 1 本を、note・LINE・X 向けにまるごとリパーパス
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
                YouTube・ポッドキャストの音声をアップロードするだけで、
                日本のクリエイターが毎日使う 3 プラットフォーム向けに
                最適化されたテキストを AI が同時生成します。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Stat icon={<Mic className="size-4" />} label="今月の生成数" value="12" />
              <Stat icon={<Zap className="size-4" />} label="節約時間" value="8.2h" />
            </div>
          </div>
        </section>

        {/* Upload + Transcript preview */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <UploadPanel />
          </div>
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">文字起こし (プレビュー)</CardTitle>
                <CardDescription>
                  Whisper で生成された日本語トランスクリプトがここに表示されます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted text-muted-foreground max-h-64 overflow-y-auto rounded-md p-4 text-xs leading-6 whitespace-pre-wrap">
                  {SAMPLE_TRANSCRIPT}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Generated outputs */}
        <section className="mt-10 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                プラットフォーム別アウトプット
              </h2>
              <p className="text-muted-foreground text-sm">
                それぞれ手動で調整し、ワンクリックでコピーできます。
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <GeneratedOutputCard
              platform="note"
              title="note"
              subtitle="見出し・目次つき長文ブログ形式"
              charHint="推奨: 1,500〜3,000字"
              initialContent={SAMPLE_NOTE}
            />
            <GeneratedOutputCard
              platform="line"
              title="LINE 公式"
              subtitle="吹き出しに馴染む親しみやすい短文＆絵文字"
              charHint="推奨: 300字以内"
              initialContent={SAMPLE_LINE}
            />
            <GeneratedOutputCard
              platform="x"
              title="X (旧Twitter)"
              subtitle="フック＆ハッシュタグ付き140字ポスト"
              charHint="上限: 140字"
              initialContent={SAMPLE_X}
            />
          </div>
        </section>

        {/* History */}
        <section className="mt-10">
          <HistorySection />
        </section>

        <footer className="text-muted-foreground mt-16 flex flex-col items-center gap-1 pb-8 text-xs">
          <p>© 2026 J-Creator AI Sync</p>
          <p>
            Next.js (App Router) ・ Tailwind CSS ・ Shadcn UI ・ Supabase ・
            OpenAI (Whisper + GPT-4o / Claude 3.5 Sonnet)
          </p>
        </footer>
      </main>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border px-4 py-2 shadow-xs">
      <span className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-md">
        {icon}
      </span>
      <div>
        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
