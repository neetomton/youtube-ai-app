import Link from "next/link";
import { ChevronRight, FileAudio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContentGeneration } from "@/lib/db/generations";

type Props = {
  items: ContentGeneration[];
  /** Optional CTA shown when the list is empty. */
  emptyState?: React.ReactNode;
};

function formatJaDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function completedPlatforms(item: ContentGeneration) {
  const out: Array<"note" | "LINE" | "X"> = [];
  if (item.note_content) out.push("note");
  if (item.line_content) out.push("LINE");
  if (item.x_content) out.push("X");
  return out;
}

export function HistorySection({ items, emptyState }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">最近の生成履歴</CardTitle>
        <CardDescription>
          過去に生成したコンテンツをいつでも呼び出して再利用できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {items.length === 0 ? (
          <div className="text-muted-foreground px-6 py-10 text-center text-sm">
            {emptyState ?? (
              <p>まだ生成履歴がありません。音声をアップロードして始めましょう。</p>
            )}
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {items.map((item) => {
              const platforms = completedPlatforms(item);
              return (
                <li key={item.id}>
                  <Link
                    href={`/generations/${item.id}`}
                    className="hover:bg-accent/40 flex items-center gap-4 px-6 py-4 transition-colors"
                  >
                    <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
                      <FileAudio className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.original_filename ?? "無題のソース"}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {formatJaDateTime(item.created_at)}
                      </p>
                    </div>
                    <div className="hidden gap-1.5 sm:flex">
                      {platforms.length === 0 ? (
                        <Badge variant="outline">文字起こしのみ</Badge>
                      ) : (
                        platforms.map((p) => (
                          <Badge key={p} variant="secondary">
                            {p}
                          </Badge>
                        ))
                      )}
                    </div>
                    <Button variant="ghost" size="icon" aria-label="開く" asChild>
                      <span>
                        <ChevronRight className="size-4" />
                      </span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
