import Link from "next/link";
import { Sparkles } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function SiteHeader() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  return (
    <header className="border-border/80 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Sparkles className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            J-Creator AI Sync
          </span>
          <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
            β
          </Badge>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            ダッシュボード
          </Link>
          <Link
            href="/history"
            className="transition-colors hover:text-foreground"
          >
            履歴
          </Link>
          <Link
            href="/settings"
            className="transition-colors hover:text-foreground"
          >
            設定
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-muted-foreground hidden max-w-[16ch] truncate text-sm sm:inline-block">
                {user.email}
              </span>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm">
                  ログアウト
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">無料で始める</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
