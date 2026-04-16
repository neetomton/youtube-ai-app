"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Loader2, Pencil, Save } from "lucide-react";

import { saveEditedContent } from "@/app/actions/generate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type PlatformKey = "note" | "line" | "x";

type PlatformStyles = {
  accent: string;
  badge: string;
  ring: string;
};

const PLATFORM_STYLES: Record<PlatformKey, PlatformStyles> = {
  note: {
    accent: "bg-brand-note",
    badge: "bg-brand-note/15 text-[oklch(0.35_0.15_155)]",
    ring: "ring-brand-note/40",
  },
  line: {
    accent: "bg-brand-line",
    badge: "bg-brand-line/15 text-[oklch(0.35_0.18_145)]",
    ring: "ring-brand-line/40",
  },
  x: {
    accent: "bg-brand-x",
    badge: "bg-brand-x/10 text-foreground",
    ring: "ring-brand-x/30",
  },
};

type GeneratedOutputCardProps = {
  platform: PlatformKey;
  title: string;
  subtitle: string;
  charHint?: string;
  initialContent: string;
  /** When provided, editing persists to DB via saveEditedContent action. */
  generationId?: string;
  /** Whether the card is backed by a real row (vs. placeholder). */
  editable?: boolean;
};

export function GeneratedOutputCard({
  platform,
  title,
  subtitle,
  charHint,
  initialContent,
  generationId,
  editable = true,
}: GeneratedOutputCardProps) {
  const [content, setContent] = useState(initialContent);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const styles = PLATFORM_STYLES[platform];

  // Keep content in sync when the server re-renders with new generated text.
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no-op */
    }
  }

  function onToggleEdit() {
    if (!editing) {
      setEditing(true);
      return;
    }
    // Editing -> Save
    if (!generationId) {
      setEditing(false);
      return;
    }
    setSaveError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", generationId);
      fd.set("platform", platform);
      fd.set("content", content);
      const result = await saveEditedContent({}, fd);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden pt-0">
      <div className={cn("h-1.5 w-full", styles.accent)} />
      <CardHeader className="pt-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge className={cn("border-transparent", styles.badge)}>
            {title}
          </Badge>
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={editing ? "保存" : "編集"}
              onClick={onToggleEdit}
              disabled={!editable || pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                <Save className="size-4" />
              ) : (
                <Pencil className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="クリップボードにコピー"
              onClick={copy}
              disabled={!content || content.length === 0}
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <Textarea
          value={content}
          readOnly={!editing}
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "min-h-64 flex-1 resize-none font-sans text-sm leading-7",
            editing && cn("ring-2", styles.ring),
          )}
        />
        {saveError ? (
          <p className="text-destructive text-xs">{saveError}</p>
        ) : null}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{content.length.toLocaleString("ja-JP")} 文字</span>
          {charHint ? <span>{charHint}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
