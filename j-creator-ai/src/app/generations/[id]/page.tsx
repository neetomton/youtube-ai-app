import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileAudio, Sparkles } from "lucide-react";

import { GeneratedOutputCard } from "@/components/generated-output-card";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGenerationById } from "@/lib/db/generations";

export const metadata = {
  title: "文字起こし結果 | J-Creator AI Sync",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatJaDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function GenerationPage({ params }: PageProps) {
  const { id } = await params;
  const generation = await getGenerationById(id);

  if (!generation) {
    notFound();
  }

  const {
    original_filename,
    transcription,
    note_content,
    line_content,
    x_content,
    created_at,
  } = generation;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" /> ダッシュボードに戻る
          </Link>
        </nav>

        <section className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 gap-1.5">
              <FileAudio className="size-3" />
              {original_filename ?? "無題のソース"}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              文字起こし結果
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              作成日時: {formatJaDate(created_at)}
            </p>
          </div>
        </section>

        <section className="mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">文字起こし (Whisper)</CardTitle>
              <CardDescription>
                OpenAI Whisper が生成した日本語トランスクリプトです。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted text-foreground max-h-[420px] overflow-y-auto rounded-md p-4 text-sm leading-7 whitespace-pre-wrap">
                {transcription && transcription.length > 0
                  ? transcription
                  : "(文字起こしがまだ生成されていません)"}
              </pre>
              {transcription ? (
                <p className="text-muted-foreground mt-2 text-xs">
                  {transcription.length.toLocaleString("ja-JP")} 文字
                </p>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                プラットフォーム別アウトプット
              </h2>
              <p className="text-muted-foreground text-sm">
                note / LINE 公式 / X 向けの最適化は Phase 4 で有効化されます。
              </p>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Sparkles className="size-3" /> Phase 4 に続く
            </Badge>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <GeneratedOutputCard
              platform="note"
              title="note"
              subtitle="見出し・目次つき長文ブログ形式"
              charHint="推奨: 1,500〜3,000字"
              initialContent={
                note_content ?? "(Phase 4 で note 向け本文を生成します)"
              }
            />
            <GeneratedOutputCard
              platform="line"
              title="LINE 公式"
              subtitle="吹き出しに馴染む親しみやすい短文＆絵文字"
              charHint="推奨: 300字以内"
              initialContent={
                line_content ?? "(Phase 4 で LINE 向け本文を生成します)"
              }
            />
            <GeneratedOutputCard
              platform="x"
              title="X (旧Twitter)"
              subtitle="フック＆ハッシュタグ付き140字ポスト"
              charHint="上限: 140字"
              initialContent={
                x_content ?? "(Phase 4 で X 向け本文を生成します)"
              }
            />
          </div>
        </section>
      </main>
    </>
  );
}
