"use client";

import { useRef, useState } from "react";
import { Button, inputClass } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (url: string) => void;
  name?: string; // berilsa — forma bilan birga yuboriladi
  compact?: boolean;
};

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Yuklab bo'lmadi");
  return data.url;
}

export function ImageInput({ value, onChange, name, compact }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex gap-3", compact ? "items-center" : "flex-col sm:flex-row sm:items-start")}>
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2",
          compact ? "size-14" : "aspect-[16/10] w-full sm:w-44",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview, optimizatsiya shart emas */}
        {value && <img src={value} alt="" className="size-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... yoki yuklang"
          aria-label="Rasm URL"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Yuklanmoqda..." : "Rasm yuklash"}
          </Button>
          {value && (
            <Button variant="ghost" onClick={() => onChange("")}>
              Olib tashlash
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

/** Forma ichida o'z holatini saqlaydigan variant. */
export function ImageField({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return <ImageInput name={name} value={value} onChange={setValue} />;
}
