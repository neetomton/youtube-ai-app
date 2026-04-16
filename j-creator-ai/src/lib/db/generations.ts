import { createClient } from "@/lib/supabase/server";

export type ContentGeneration = {
  id: string;
  user_id: string;
  original_filename: string | null;
  transcription: string | null;
  note_content: string | null;
  line_content: string | null;
  x_content: string | null;
  created_at: string;
};

/**
 * Returns the N most recent generations for the current user. RLS makes this
 * automatically scoped; no explicit user_id filter is needed.
 */
export async function listRecentGenerations(
  limit = 5,
): Promise<ContentGeneration[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_generations")
    .select(
      "id, user_id, original_filename, transcription, note_content, line_content, x_content, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listRecentGenerations]", error);
    return [];
  }
  return data ?? [];
}

export async function getGenerationById(
  id: string,
): Promise<ContentGeneration | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_generations")
    .select(
      "id, user_id, original_filename, transcription, note_content, line_content, x_content, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getGenerationById]", error);
    return null;
  }
  return data;
}
