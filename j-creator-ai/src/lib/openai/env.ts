/**
 * Server-side only. Never import from a Client Component.
 */
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

export function isOpenAIConfigured() {
  return OPENAI_API_KEY.length > 0;
}
