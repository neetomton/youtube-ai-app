import OpenAI from "openai";
import { OPENAI_API_KEY } from "./env";

/**
 * Singleton OpenAI client. Import only from Server Components or Server
 * Actions — this module reads `OPENAI_API_KEY` from the process environment.
 */
let cached: OpenAI | null = null;

export function getOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY が未設定です。.env.local に設定してください。",
    );
  }
  if (!cached) {
    cached = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return cached;
}
