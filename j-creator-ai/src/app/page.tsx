import Link from "next/link";
import { Info, Mic, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistorySection } from "@/components/history-section";
import { SiteHeader } from "@/components/site-header";
import { UploadPanel } from "@/components/upload-panel";
import { listRecentGenerations } from "@/lib/db/generations";
import { isOpenAIConfigured } from "@/lib/openai/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function Home() {
  const configuredSupabase = isSupabaseConfigured();
  const user = configuredSupabase ? await getCurrentUser() : null;
  const configuredOpenAI = isOpenAIConfigured();
  const canSubmit = Boolean(user) && configuredSupabase && configuredOpenAI;

  const disabledReason = !configuredSupabase
    ? "Supabase の設定後に有効になります。"
    : !user
    ? "ログインすると文字起こしを実行できます。"
    : !configuredOpenAI
    ? "OPENAI_API_KEY を設定すると文字起こしを実行できます。"
    : undefined;

  const generations = user ? await listRecentGenerations(5) : [];
  const monthlyCount = generations.filter((g) => {
    const d = new Date(g.created_at);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }).length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5">
                <Sparkles className="size-3" /> Phase 3 — Whisper 文字起こし
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
              <Stat
                icon={<Mic className="size-4" />}
                label="今月の生成数"
                value={user ? String(monthlyCount) : "—"}
              />
              <Stat
                icon={<Zap className="size-4" />}
                label="保存済み"
                value={user ? String(generations.length) : "—"}
              />
            </div>
          </div>
        </section>

        {!configuredSupabase || !configuredOpenAI ? (
          <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
            <CardHeader className="flex-row gap-3 space-y-0">
              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 flex size-8 items-center justify-center rounded-md">
                <Info className="size-4" />
              </span>
              <div>
                <CardTitle className="text-base">セットアップが未完了です</CardTitle>
                <CardDescription>
                  {!configuredSupabase && <>Supabase の接続情報が未設定です。</>}{" "}
                  {!configuredOpenAI && <>OPENAI_API_KEY が未設定です。</>}{" "}
                  <code className="bg-muted rounded px-1 py-0.5 text-xs">
                    .env.local
                  </code>{" "}
                  に値を追加してから再起動してください。
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {/* Upload */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {user ? (
              <UploadPanel canSubmit={canSubmit} disabledReason={disabledReason} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ログインが必要です</CardTitle>
                  <CardDescription>
                    文字起こしを実行するには、J-Creator AI Sync のアカウントでログインしてください。
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild>
                    <Link href="/login">ログイン</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/signup">新規登録</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">パイプラインの流れ</CardTitle>
                <CardDescription>
                  アップロード後、以下のステップで処理が進みます。
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-7">
                <ol className="list-inside list-decimal space-y-1">
                  <li>音声ファイルをサーバーへ送信（最大 25MB）</li>
                  <li>OpenAI Whisper で日本語トランスクリプト生成</li>
                  <li>結果を Supabase に保存し、詳細ページへ遷移</li>
                  <li>
                    <span className="text-foreground">Phase 4:</span> note / LINE / X
                    向けに並行リパーパス（準備中）
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* History */}
        <section className="mt-10">
          <HistorySection
            items={generations}
            emptyState={
              !user ? (
                <p>ログインすると、ご自身の生成履歴がここに表示されます。</p>
              ) : undefined
            }
          />
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
