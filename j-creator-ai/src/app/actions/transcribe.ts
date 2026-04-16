"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getOpenAIClient } from "@/lib/openai/client";
import { isOpenAIConfigured } from "@/lib/openai/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type TranscribeState = {
  error?: string;
};

// Whisper の入力上限。参考: https://platform.openai.com/docs/guides/speech-to-text
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  "mp3",
  "m4a",
  "wav",
  "mp4",
  "mpga",
  "mpeg",
  "webm",
];

/**
 * Server Action: 音声ファイルを受け取り
 *   1. 認証済みユーザーか検証
 *   2. content_generations 行を作成
 *   3. OpenAI Whisper で日本語に文字起こし
 *   4. 結果を DB に保存
 *   5. 生成詳細ページへリダイレクト
 */
export async function transcribeAudio(
  _prev: TranscribeState,
  formData: FormData,
): Promise<TranscribeState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase が未設定です。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。",
    };
  }
  if (!isOpenAIConfigured()) {
    return {
      error: "OPENAI_API_KEY が未設定です。.env.local に設定してください。",
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "ログインしていません。再ログインしてください。" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "音声ファイルを選択してください。" };
  }

  if (file.size > MAX_BYTES) {
    return {
      error: `ファイルサイズが 25MB を超えています（${(
        file.size /
        1024 /
        1024
      ).toFixed(1)}MB）。`,
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      error: `対応していない拡張子です（.${extension}）。.mp3 / .m4a / .wav などを指定してください。`,
    };
  }

  const supabase = await createClient();

  // Step 1: 行を先に作ってから Whisper 呼び出し。呼び出し中の状態も残る。
  const { data: row, error: insertError } = await supabase
    .from("content_generations")
    .insert({
      user_id: user.id,
      original_filename: file.name,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    return {
      error: `生成レコードの作成に失敗しました: ${
        insertError?.message ?? "unknown"
      }`,
    };
  }

  // Step 2: Whisper 呼び出し
  let transcription: string;
  try {
    const openai = getOpenAIClient();
    // response_format=text のとき、SDK は文字列をそのまま返す。
    transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "ja",
      response_format: "text",
    });
  } catch (err) {
    // 失敗したレコードはあとで再試行できるよう残す方針だが、
    // ここでは掃除してユーザーには明確にエラーを返す。
    await supabase.from("content_generations").delete().eq("id", row.id);
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Whisper の呼び出しに失敗しました: ${message}` };
  }

  // Step 3: transcription を保存
  const { error: updateError } = await supabase
    .from("content_generations")
    .update({ transcription })
    .eq("id", row.id);

  if (updateError) {
    return {
      error: `文字起こしの保存に失敗しました: ${updateError.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath(`/generations/${row.id}`);
  redirect(`/generations/${row.id}`);
}
