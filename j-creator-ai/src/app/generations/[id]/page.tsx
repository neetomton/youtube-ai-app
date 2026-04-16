import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileAudio, Sparkles } from "lucide-react";

import { GenerateTrigger } from "@/components/generate-trigger";
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
import { isOpenAIConfigured } from "@/lib/openai/env";

export const metadata = {
  title: "文字起こし結果 | J-Creator AI Sync",
};

// Vercel Hobby プランの上限 (60 秒) に合わせる。Pro プランで伸ばす場合は
// vercel.json の functions.maxDuration を最大 300 に変更する。
export const maxDuration = 60;

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

  const hasAllOutputs = Boolean(note_content && line_content && x_content);
  const hasAnyOutput = Boolean(note_content || line_content || x_content);
  const canGenerate = Boolean(transcription && transcription.length > 0);

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                プラットフォーム別アウトプット
              </h2>
              <p className="text-muted-foreground text-sm">
                note / LINE 公式 / X 向けにトーン・文字数を最適化して同時生成します。
              </p>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Sparkles className="size-3" /> GPT-4o ベース
            </Badge>
          </div>

          {canGenerate ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {hasAllOutputs
                    ? "再生成する"
                    : hasAnyOutput
                    ? "未生成のものを含めて再実行"
                    : "3 プラットフォーム向けに生成"}
                </CardTitle>
                <CardDescription>
                  クリックすると note / LINE / X を並行で生成します。既存の内容は上書きされます。
                  {!isOpenAIConfigured()
                    ? "（OPENAI_API_KEY を .env.local に設定してください）"
                    : null}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerateTrigger
                  generationId={id}
                  label={
                    hasAnyOutput ? "もう一度生成する" : "3 プラットフォーム向けに生成"
                  }
                  disabled={!isOpenAIConfigured()}
                />
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            <GeneratedOutputCard
              platform="note"
              title="note"
              subtitle="見出し・目次つき長文ブログ形式"
              charHint="推奨: 1,500〜3,000字"
              generationId={id}
              editable={Boolean(note_content)}
              initialContent={
                note_content ??
                "(上のボタンから生成するか、文字起こしを先に完了してください)"
              }
            />
            <GeneratedOutputCard
              platform="line"
              title="LINE 公式"
              subtitle="吹き出しに馴染む親しみやすい短文＆絵文字"
              charHint="推奨: 300字以内"
              generationId={id}
              editable={Boolean(line_content)}
              initialContent={
                line_content ??
                "(上のボタンから生成するか、文字起こしを先に完了してください)"
              }
            />
            <GeneratedOutputCard
              platform="x"
              title="X (旧Twitter)"
              subtitle="フック＆ハッシュタグ付き140字ポスト"
              charHint="上限: 140字"
              generationId={id}
              editable={Boolean(x_content)}
              initialContent={
                x_content ??
                "(上のボタンから生成するか、文字起こしを先に完了してください)"
              }
            />
          </div>
        </section>
      </main>
    </>
  );
}
