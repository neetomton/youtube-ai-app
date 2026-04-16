import { getOpenAIClient } from "@/lib/openai/client";
import {
  PLATFORM_SYSTEM_PROMPTS,
  type PlatformKey,
  buildUserMessage,
} from "./prompts";

/**
 * Model used for platform-specific repurposing. Override with OPENAI_MODEL
 * in the environment (e.g. `gpt-4o` for higher quality, `gpt-4o-mini` for
 * cheaper / faster iterations).
 */
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type GenerateOptions = {
  /** 0〜2、低いほど固め。LINE / note は 0.7、X は 0.8 くらいが目安。 */
  temperature?: number;
};

/**
 * Calls the chat completions API for a single platform and returns the raw
 * text. Throws on API failure — callers wrap in try/catch.
 */
export async function generatePlatformContent(
  platform: PlatformKey,
  transcript: string,
  { temperature = 0.7 }: GenerateOptions = {},
): Promise<string> {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature,
    messages: [
      { role: "system", content: PLATFORM_SYSTEM_PROMPTS[platform] },
      { role: "user", content: buildUserMessage(transcript) },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return text.trim();
}

/**
 * Generates all three platform outputs in parallel and returns them
 * together. `Promise.allSettled` so a single platform failure doesn't
 * wipe out the other two.
 */
export async function generateAllPlatforms(transcript: string) {
  const results = await Promise.allSettled([
    generatePlatformContent("note", transcript, { temperature: 0.7 }),
    generatePlatformContent("line", transcript, { temperature: 0.7 }),
    generatePlatformContent("x", transcript, { temperature: 0.85 }),
  ]);

  const [noteResult, lineResult, xResult] = results;

  return {
    note:
      noteResult.status === "fulfilled" ? noteResult.value : null,
    line:
      lineResult.status === "fulfilled" ? lineResult.value : null,
    x: xResult.status === "fulfilled" ? xResult.value : null,
    errors: results
      .map((r, i) =>
        r.status === "rejected"
          ? {
              platform: (["note", "line", "x"] as const)[i],
              message: r.reason instanceof Error ? r.reason.message : String(r.reason),
            }
          : null,
      )
      .filter((e): e is { platform: PlatformKey; message: string } => e !== null),
  };
}
