"use client";

import { useState } from "react";
import { SCENE_KINDS, SCENE_LABELS, sceneDataSchemas, type SceneKind } from "@/features/secret/schema";
import { ImageInput } from "./ImageInput";
import { Button, Checkbox, Input, Select, Textarea, inputClass } from "@/components/ui/form";

export type SceneItem = { id: string; kind: SceneKind; visible: boolean; data: Record<string, unknown> };

const newId = () => Math.random().toString(36).slice(2);
const emptyData = (kind: SceneKind) => sceneDataSchemas[kind].parse({}) as Record<string, unknown>;

type Props = { name: string; defaultValue: SceneItem[] };

/** Sahnalar ro'yxati: qo'shish, tartibini o'zgartirish, o'chirish. Natija yashirin inputda JSON bo'lib ketadi. */
export function SceneEditor({ name, defaultValue }: Props) {
  const [items, setItems] = useState<SceneItem[]>(defaultValue);

  const update = (id: string, patch: Partial<SceneItem>) => setItems((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const setData = (id: string, data: Record<string, unknown>) => update(id, { data });
  const add = (kind: SceneKind) => setItems((list) => [...list, { id: newId(), kind, visible: true, data: emptyData(kind) }]);
  const remove = (id: string) => setItems((list) => list.filter((s) => s.id !== id));
  const move = (index: number, dir: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(items.map((s) => ({ ...s, data: JSON.stringify(s.data) })))} />

      {items.map((scene, i) => (
        <div key={scene.id} className="rounded-2xl border border-border bg-bg p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-xs font-bold text-accent">{i + 1}</span>
            <Select
              value={scene.kind}
              onChange={(e) => update(scene.id, { kind: e.target.value as SceneKind, data: emptyData(e.target.value as SceneKind) })}
              className="w-auto"
            >
              {SCENE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {SCENE_LABELS[k]}
                </option>
              ))}
            </Select>
            <Checkbox checked={scene.visible} onChange={(e) => update(scene.id, { visible: e.target.checked })} label="Ko'rinsin" />
            <div className="ml-auto flex gap-1">
              <Button variant="ghost" onClick={() => move(i, -1)} aria-label="Yuqoriga">↑</Button>
              <Button variant="ghost" onClick={() => move(i, 1)} aria-label="Pastga">↓</Button>
              <Button variant="ghost" onClick={() => remove(scene.id)} aria-label="O'chirish">✕</Button>
            </div>
          </div>
          <SceneFields scene={scene} onChange={(data) => setData(scene.id, data)} />
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {SCENE_KINDS.map((k) => (
          <Button key={k} variant="ghost" onClick={() => add(k)}>
            + {SCENE_LABELS[k]}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Har sahna turining maydonlari ---------- */

type FieldsProps = { scene: SceneItem; onChange: (data: Record<string, unknown>) => void };

function SceneFields({ scene, onChange }: FieldsProps) {
  const d = scene.data;
  const set = (patch: Record<string, unknown>) => onChange({ ...d, ...patch });

  switch (scene.kind) {
    case "STORY":
      return (
        <Labelled label="Gaplar — har qatorga bittadan">
          <Textarea
            rows={6}
            value={((d.lines as string[]) ?? []).join("\n")}
            onChange={(e) => set({ lines: e.target.value.split("\n") })}
            placeholder={"Seni ko'rgan kunim...\nKeyin esa...\nVa mana shu kun keldi"}
          />
        </Labelled>
      );

    case "WALL":
      return (
        <ListEditor
          label="Devordagi yozuvlar"
          items={(d.notes as { text: string; author: string }[]) ?? []}
          empty={{ text: "", author: "" }}
          onChange={(notes) => set({ notes })}
          render={(note, update) => (
            <>
              <Textarea rows={2} value={note.text} onChange={(e) => update({ ...note, text: e.target.value })} placeholder="Yozuv matni" />
              <Input value={note.author} onChange={(e) => update({ ...note, author: e.target.value })} placeholder="Kim yozgan (ixtiyoriy)" />
            </>
          )}
        />
      );

    case "GIFT":
      return (
        <div className="space-y-3">
          <Labelled label="Quti ichidagi yozuv">
            <Textarea rows={3} value={(d.message as string) ?? ""} onChange={(e) => set({ message: e.target.value })} />
          </Labelled>
          <div className="grid gap-3 sm:grid-cols-2">
            <Labelled label="Shardagi so'z (qisqa)">
              <Input value={(d.balloonText as string) ?? ""} onChange={(e) => set({ balloonText: e.target.value })} placeholder="❤" />
            </Labelled>
            <Labelled label="Imzo">
              <Input value={(d.signature as string) ?? ""} onChange={(e) => set({ signature: e.target.value })} />
            </Labelled>
          </div>
        </div>
      );

    case "SCRATCH":
      return (
        <div className="space-y-3">
          <Labelled label="Yashirin yozuv">
            <Textarea rows={3} value={(d.hidden as string) ?? ""} onChange={(e) => set({ hidden: e.target.value })} />
          </Labelled>
          <Labelled label="Ko'rsatma">
            <Input value={(d.hint as string) ?? ""} onChange={(e) => set({ hint: e.target.value })} placeholder="Barmoq bilan suring" />
          </Labelled>
        </div>
      );

    case "GALLERY":
      return (
        <ListEditor
          label="Suratlar"
          items={(d.photos as { src: string; caption: string }[]) ?? []}
          empty={{ src: "", caption: "" }}
          onChange={(photos) => set({ photos })}
          render={(photo, update) => (
            <>
              <ImageInput value={photo.src} onChange={(src) => update({ ...photo, src })} compact />
              <Input value={photo.caption} onChange={(e) => update({ ...photo, caption: e.target.value })} placeholder="Izoh" />
            </>
          )}
        />
      );

    case "HEARTS":
      return (
        <div className="space-y-3">
          <Labelled label="Nechta bosilsa ochilsin">
            <Input
              type="number"
              min={1}
              max={200}
              value={String(d.target ?? 20)}
              onChange={(e) => set({ target: Number(e.target.value) })}
              className="w-32"
            />
          </Labelled>
          <Labelled label="Yashirin xabar">
            <Textarea rows={3} value={(d.message as string) ?? ""} onChange={(e) => set({ message: e.target.value })} />
          </Labelled>
        </div>
      );

    case "QUIZ":
      return (
        <div className="space-y-3">
          <ListEditor
            label="Savollar"
            items={(d.questions as { question: string; options: string[]; answer: number }[]) ?? []}
            empty={{ question: "", options: ["", ""], answer: 0 }}
            onChange={(questions) => set({ questions })}
            render={(q, update) => (
              <>
                <Input value={q.question} onChange={(e) => update({ ...q, question: e.target.value })} placeholder="Savol" />
                {q.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.answer === oi}
                      onChange={() => update({ ...q, answer: oi })}
                      aria-label={`${oi + 1}-javob to'g'ri`}
                      className="size-4 accent-[var(--accent)]"
                    />
                    <Input
                      value={option}
                      onChange={(e) => update({ ...q, options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                      placeholder={`Javob ${oi + 1}`}
                    />
                    {q.options.length > 2 && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          update({ ...q, options: q.options.filter((_, k) => k !== oi), answer: q.answer >= oi ? Math.max(0, q.answer - 1) : q.answer })
                        }
                        aria-label="Javobni o'chirish"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {q.options.length < 4 && (
                  <Button variant="ghost" onClick={() => update({ ...q, options: [...q.options, ""] })}>
                    + Javob
                  </Button>
                )}
                <p className="text-xs text-muted">Nuqtacha bilan to&apos;g&apos;ri javobni belgilang.</p>
              </>
            )}
          />
          <Labelled label="Oxirgi xabar (sovg'a)">
            <Textarea rows={2} value={(d.reward as string) ?? ""} onChange={(e) => set({ reward: e.target.value })} />
          </Labelled>
        </div>
      );
  }
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-semibold text-muted">{label}</span>
      {children}
    </div>
  );
}

/** Bir xil tuzilishdagi elementlar ro'yxati: qo'shish / o'chirish / tahrirlash. */
function ListEditor<T>({
  label,
  items,
  empty,
  onChange,
  render,
}: {
  label: string;
  items: T[];
  empty: T;
  onChange: (items: T[]) => void;
  render: (item: T, update: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-muted">{label}</span>
      {items.map((item, i) => (
        <div key={i} className={`${inputClass} flex flex-col gap-2 !h-auto !py-3`}>
          {render(item, (next) => onChange(items.map((x, k) => (k === i ? next : x))))}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => onChange(items.filter((_, k) => k !== i))}>
              O&apos;chirish
            </Button>
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...items, structuredClone(empty)])}>
        + Qo&apos;shish
      </Button>
    </div>
  );
}
