import { FileAudio, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type HistoryItem = {
  id: string;
  filename: string;
  createdAt: string;
  duration: string;
  platforms: Array<"note" | "LINE" | "X">;
};

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    filename: "ep42_朝活ラジオ.m4a",
    createdAt: "2026/04/14 07:42",
    duration: "28:11",
    platforms: ["note", "LINE", "X"],
  },
  {
    id: "2",
    filename: "youtube_新商品発表.mp3",
    createdAt: "2026/04/13 21:08",
    duration: "14:36",
    platforms: ["note", "X"],
  },
  {
    id: "3",
    filename: "podcast_ゲスト対談_vol03.mp3",
    createdAt: "2026/04/12 18:20",
    duration: "52:04",
    platforms: ["note", "LINE", "X"],
  },
];

export function HistorySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">最近の生成履歴</CardTitle>
        <CardDescription>
          過去に生成したコンテンツをいつでも呼び出して再利用できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-border divide-y">
          {MOCK_HISTORY.map((item) => (
            <li
              key={item.id}
              className="hover:bg-accent/40 flex items-center gap-4 px-6 py-4 transition-colors"
            >
              <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
                <FileAudio className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.filename}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {item.createdAt} ・ {item.duration}
                </p>
              </div>
              <div className="hidden gap-1.5 sm:flex">
                {item.platforms.map((p) => (
                  <Badge key={p} variant="secondary">
                    {p}
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="icon" aria-label="開く">
                <ChevronRight className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="px-6 pt-4">
          <Button variant="outline" className="w-full">
            すべての履歴を見る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
