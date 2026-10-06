"use client";

import { useRef, useState } from "react";
import { Button, inputClass } from "@/components/ui/form";
import { uploadImage } from "./ImageInput";

type Props = { name: string; defaultValue?: string; accept?: string; label?: string };

/** PDF (CV) yuklash: fayl tanlanadi yoki tayyor havola qo'yiladi. Rasm yuklash bilan bir xil API. */
export function FileField({ name, defaultValue = "", accept = "application/pdf", label = "PDF yuklash" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setValue(await uploadImage(file)); // /api/upload PDF'ni ham qabul qiladi
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://... yoki yuklang"
        aria-label="Fayl havolasi"
        className={inputClass}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Yuklanmoqda..." : label}
        </Button>
        {value && (
          <>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent hover:underline">
              Ochish ↗
            </a>
            <Button variant="ghost" onClick={() => setValue("")}>
              Olib tashlash
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input ref={fileRef} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
