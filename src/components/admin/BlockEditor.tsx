"use client";

import { useState } from "react";
import type { Block, BlockType } from "@/lib/content/blocks";
import { IMAGE_LAYOUTS } from "@/lib/content/blocks";
import { ImageInput } from "./ImageInput";
import { Button, Input, Select, Textarea } from "@/components/ui/form";

const NEW_BLOCK: Record<BlockType, () => Block> = {
  paragraph: () => ({ type: "paragraph", text: "" }),
  heading: () => ({ type: "heading", text: "", level: 2 }),
  image: () => ({ type: "image", src: "", alt: "", layout: "center" }),
  gallery: () => ({ type: "gallery", images: [{ src: "", alt: "" }] }),
  quote: () => ({ type: "quote", text: "" }),
  code: () => ({ type: "code", code: "" }),
  embed: () => ({ type: "embed", url: "" }),
  divider: () => ({ type: "divider" }),
};

const TYPE_LABEL: Record<BlockType, string> = {
  paragraph: "Matn",
  heading: "Sarlavha",
  image: "Rasm",
  gallery: "Galereya",
  quote: "Iqtibos",
  code: "Kod",
  embed: "YouTube",
  divider: "Ajratgich",
};

const LAYOUT_LABEL: Record<(typeof IMAGE_LAYOUTS)[number], string> = {
  full: "To'liq ekran",
  wide: "Keng",
  center: "Markazda",
  left: "Chapda (matn o'ngda)",
  right: "O'ngda (matn chapda)",
};

type Props = { name: string; defaultValue: Block[] };

// Barqaror React kalitlari: bloklar surilganda holat to'g'ri ko'chadi.
type Item = { id: number; block: Block };

let nextId = 0;
const toItem = (block: Block): Item => ({ id: nextId++, block });

/**
 * Blok-editor: bloklarni qo'shish, tartibini o'zgartirish, o'chirish.
 * Natija `name` nomli yashirin inputda JSON bo'lib forma bilan yuboriladi.
 */
export function BlockEditor({ name, defaultValue }: Props) {
  const [items, setItems] = useState<Item[]>(() => defaultValue.map(toItem));

  const update = (i: number, patch: Partial<Block>) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, block: { ...x.block, ...patch } as Block } : x)));
  const remove = (i: number) => setItems((xs) => xs.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) =>
    setItems((xs) => {
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const next = [...xs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const append = (type: BlockType) => setItems((xs) => [...xs, toItem(NEW_BLOCK[type]())]);

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items.map((x) => x.block))} />
      {items.map(({ id, block }, i) => (
        <div key={id} className="animate-pop-in rounded-2xl border border-border bg-bg p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">{TYPE_LABEL[block.type]}</span>
            <div className="flex gap-1">
              <IconBtn label="Yuqoriga" onClick={() => move(i, -1)} disabled={i === 0}>↑</IconBtn>
              <IconBtn label="Pastga" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</IconBtn>
              <IconBtn label="Blokni o'chirish" onClick={() => remove(i)} danger>✕</IconBtn>
            </div>
          </div>
          <BlockFields block={block} onChange={(patch) => update(i, patch)} />
        </div>
      ))}
      <AddBlock onAdd={append} />
    </div>
  );
}

function BlockFields({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) {
  switch (block.type) {
    case "paragraph":
      return (
        <>
          <Textarea rows={5} value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Matn..." />
          <p className="mt-1.5 text-xs text-muted">**qalin**, *kursiv*, `kod`, [havola](https://...)</p>
        </>
      );
    case "heading":
      return (
        <div className="flex gap-2">
          <Select className="w-24" value={block.level} onChange={(e) => onChange({ level: Number(e.target.value) as 2 | 3 })}>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </Select>
          <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Sarlavha" />
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <ImageInput value={block.src} onChange={(src) => onChange({ src })} />
          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={block.layout} onChange={(e) => onChange({ layout: e.target.value as typeof block.layout })}>
              {IMAGE_LAYOUTS.map((l) => (
                <option key={l} value={l}>{LAYOUT_LABEL[l]}</option>
              ))}
            </Select>
            <Input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Alt matn" />
            <Input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value || undefined })} placeholder="Izoh (ixtiyoriy)" />
          </div>
        </div>
      );
    case "gallery": {
      const setImages = (images: typeof block.images) => onChange({ images });
      return (
        <div className="space-y-2">
          {block.images.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <ImageInput compact value={img.src} onChange={(src) => setImages(block.images.map((m, j) => (j === i ? { ...m, src } : m)))} />
              </div>
              <IconBtn label="Rasmni o'chirish" danger onClick={() => setImages(block.images.filter((_, j) => j !== i))}>✕</IconBtn>
            </div>
          ))}
          <Button variant="ghost" onClick={() => setImages([...block.images, { src: "", alt: "" }])}>+ Rasm</Button>
        </div>
      );
    }
    case "quote":
      return (
        <div className="space-y-2">
          <Textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Iqtibos" />
          <Input value={block.cite ?? ""} onChange={(e) => onChange({ cite: e.target.value || undefined })} placeholder="Muallif (ixtiyoriy)" />
        </div>
      );
    case "code":
      return (
        <div className="space-y-2">
          <Input value={block.lang ?? ""} onChange={(e) => onChange({ lang: e.target.value || undefined })} placeholder="Til (ts, py, go...)" />
          <Textarea rows={8} value={block.code} onChange={(e) => onChange({ code: e.target.value })} className="font-mono text-sm" spellCheck={false} />
        </div>
      );
    case "embed":
      return <Input value={block.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />;
    case "divider":
      return <hr className="border-border" />;
  }
}

function AddBlock({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-dashed border-border p-3">
      <span className="self-center px-1 text-sm text-muted">+ Qo&apos;shish:</span>
      {(Object.keys(NEW_BLOCK) as BlockType[]).map((type) => (
        <Button key={type} variant="ghost" className="px-3 py-1.5" onClick={() => onAdd(type)}>
          {TYPE_LABEL[type]}
        </Button>
      ))}
    </div>
  );
}

function IconBtn({ label, danger, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={`grid size-8 place-items-center rounded-lg text-sm transition-colors disabled:opacity-30 ${danger ? "text-red-500 hover:bg-red-500/10" : "hover:bg-surface-2"}`}
    />
  );
}
