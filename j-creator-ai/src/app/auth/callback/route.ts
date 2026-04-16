import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Supabase OAuth / メール確認の戻り先。
 * `?code=...` を受け取り、サーバー側でセッションに交換したうえで
 * `next` パラメータが指すページ（デフォルトは `/`）へリダイレクトします。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";

  // オープンリダイレクトを避けるため、同一オリジン内のパスのみ許可。
  const next = nextParam.startsWith("/") ? nextParam : "/";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Supabase が未設定です。",
      )}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "認証コードが見つかりませんでした。",
    )}`,
  );
}
