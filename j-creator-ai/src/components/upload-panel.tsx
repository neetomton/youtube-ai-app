"use client";

import { useActionState, useRef, useState } from "react";
import { FileAudio, Link2, Loader2, Upload, Wand2 } from "lucide-react";

import { transcribeAudio } from "@/app/actions/transcribe";
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

type Props = {
  /**
   * Gate for the transcribe action — parent controls this based on whether the
   * user is authenticated and env vars are present. When false, the button is
   * disabled and explains why in the help text.
   */
  canSubmit?: boolean;
  disabledReason?: string;
};

export function UploadPanel({ canSubmit = true, disabledReason }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, formAction, pending] = useActionState(transcribeAudio, {});

  function onPick() {
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(f);
        inputRef.current.files = dt.files;
      }
    }
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
        <form action={formAction}>
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">
                <FileAudio className="size-4" /> 音声ファイル
              </TabsTrigger>
              <TabsTrigger value="url" disabled>
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
                  name="file"
                  type="file"
                  accept=".mp3,.m4a,.wav,audio/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <p className="text-sm font-medium">
                    選択中:{" "}
                    <span className="text-primary">{file.name}</span>{" "}
                    <span className="text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
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
                  disabled
                />
                <p className="text-muted-foreground text-xs">
                  YouTube URL からの抽出は今後のアップデートで対応予定です。
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {state.error ? (
            <p
              className="border-destructive/40 bg-destructive/10 text-destructive mt-4 rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs">
              {disabledReason ?? "処理には数十秒〜数分かかる場合があります。"}
            </p>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={!file || pending || !canSubmit}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  文字起こし中…
                </>
              ) : (
                <>
                  <Wand2 className="size-4" />
                  文字起こしを開始
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
