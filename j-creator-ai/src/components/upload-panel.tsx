"use client";

import { useRef, useState } from "react";
import { FileAudio, Link2, Upload, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function onPick() {
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ソースを選ぶ</CardTitle>
        <CardDescription>
          音声ファイルをアップロード、または YouTube URL を貼り付けてください。
          アップロード後、Whisper で高精度の日本語文字起こしを自動生成します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <FileAudio className="size-4" /> 音声ファイル
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="size-4" /> YouTube URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={onPick}
              role="button"
              tabIndex={0}
              className={cn(
                "border-border hover:border-ring/60 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
                dragOver && "border-ring bg-accent/50",
              )}
            >
              <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                <Upload className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  ここにファイルをドラッグ＆ドロップ
                </p>
                <p className="text-muted-foreground text-xs">
                  対応フォーマット: .mp3 / .m4a / .wav（最大 25MB）
                </p>
              </div>
              <Input
                ref={inputRef}
                type="file"
                accept=".mp3,.m4a,.wav,audio/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <p className="text-sm font-medium">
                  選択中: <span className="text-primary">{file.name}</span>
                </p>
              ) : (
                <Button variant="outline" size="sm" type="button">
                  ファイルを選ぶ
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="yt-url">YouTube URL</Label>
              <Input
                id="yt-url"
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
                inputMode="url"
              />
              <p className="text-muted-foreground text-xs">
                公開されている動画のみ対応しています。
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            ※ 実際の処理は Phase 3 以降で有効化されます
          </p>
          <Button className="w-full sm:w-auto" disabled={!file}>
            <Wand2 className="size-4" /> 文字起こし＆再利用を開始
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
