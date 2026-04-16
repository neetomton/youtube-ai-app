"use client";

import { useActionState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import { generateContent } from "@/app/actions/generate";
import { Button } from "@/components/ui/button";

type Props = {
  generationId: string;
  label: string;
  disabled?: boolean;
};

export function GenerateTrigger({ generationId, label, disabled }: Props) {
  const [state, formAction, pending] = useActionState(generateContent, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={generationId} />
      <Button type="submit" disabled={pending || disabled}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            生成中…（20〜60 秒）
          </>
        ) : (
          <>
            <Wand2 className="size-4" />
            {label}
          </>
        )}
      </Button>
      {state.error ? (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="border-brand-note/40 bg-brand-note/10 rounded-md border px-3 py-2 text-sm"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
