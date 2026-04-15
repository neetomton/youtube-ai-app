import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
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
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            ログイン
          </Button>
          <Button size="sm">無料で始める</Button>
        </div>
      </div>
    </header>
  );
}
