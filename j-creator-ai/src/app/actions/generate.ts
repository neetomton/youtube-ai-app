"use server";

import { revalidatePath } from "next/cache";

import { generateAllPlatforms } from "@/lib/llm/generate";
import type { PlatformKey } from "@/lib/llm/prompts";
import { isOpenAIConfigured } from "@/lib/openai/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type GenerateState = {
  error?: string;
  success?: string;
};

/**
 * Server Action: `/generations/[id]` の「プラットフォーム別に生成」ボタンから
 * 呼び出される。3 プラットフォームを並列生成し、DB を更新する。
 */
export async function generateContent(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase が未設定です。.env.local を確認してください。",
    };
  }
  if (!isOpenAIConfigured()) {
    return {
      error: "OPENAI_API_KEY が未設定です。.env.local を確認してください。",
    };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "生成 ID が指定されていません。" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "ログインしていません。再ログインしてください。" };
  }

  const supabase = await createClient();

  // RLS がユーザー単位で絞るので、user_id 一致は Supabase 側で保証される。
  const { data: row, error: fetchError } = await supabase
    .from("content_generations")
    .select("id, transcription")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { error: `生成レコードの取得に失敗しました: ${fetchError.message}` };
  }
  if (!row) {
    return { error: "該当の生成レコードが見つかりません。" };
  }
  if (!row.transcription || row.transcription.trim().length === 0) {
    return { error: "文字起こしが空のため生成できません。" };
  }

  const outputs = await generateAllPlatforms(row.transcription);

  // 全滅時はエラーだけ返して DB は触らない。
  if (!outputs.note && !outputs.line && !outputs.x) {
    const msg =
      outputs.errors.map((e) => `${e.platform}: ${e.message}`).join(" / ") ||
      "不明なエラー";
    return { error: `すべての生成に失敗しました: ${msg}` };
  }

  const update: Record<string, string> = {};
  if (outputs.note) update.note_content = outputs.note;
  if (outputs.line) update.line_content = outputs.line;
  if (outputs.x) update.x_content = outputs.x;

  const { error: updateError } = await supabase
    .from("content_generations")
    .update(update)
    .eq("id", id);

  if (updateError) {
    return { error: `DB への保存に失敗しました: ${updateError.message}` };
  }

  revalidatePath(`/generations/${id}`);
  revalidatePath("/");

  if (outputs.errors.length > 0) {
    const failed = outputs.errors.map((e) => e.platform).join(", ");
    return {
      success: `一部のプラットフォーム（${failed}）で失敗しました。再実行してください。`,
    };
  }
  return { success: "3 プラットフォーム向けに生成しました。" };
}

/**
 * Server Action: `/generations/[id]` の各カードの「保存」ボタンから呼ばれる
 * 手動編集の反映。プラットフォーム単位で 1 カラムだけ更新する。
 */
export async function saveEditedContent(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase が未設定です。" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim() as PlatformKey;
  const content = String(formData.get("content") ?? "");

  if (!id) return { error: "生成 ID が指定されていません。" };
  if (!["note", "line", "x"].includes(platform)) {
    return { error: "プラットフォーム指定が不正です。" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "ログインしていません。" };
  }

  const column: Record<PlatformKey, string> = {
    note: "note_content",
    line: "line_content",
    x: "x_content",
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_generations")
    .update({ [column[platform]]: content })
    .eq("id", id);

  if (error) {
    return { error: `保存に失敗しました: ${error.message}` };
  }

  revalidatePath(`/generations/${id}`);
  return { success: "保存しました。" };
}
