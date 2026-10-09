import { z } from "zod";

/** Sahna turlari — admin panelda shu ro'yxatdan tanlanadi. */
export const SCENE_KINDS = ["STORY", "WALL", "GIFT", "SCRATCH", "GALLERY", "HEARTS", "QUIZ"] as const;
export type SceneKind = (typeof SCENE_KINDS)[number];

export const SCENE_LABELS: Record<SceneKind, string> = {
  STORY: "Hikoya (Keyingisi)",
  WALL: "Tilaklar devori",
  GIFT: "Quti → shar → yozuv",
  SCRATCH: "Yashirin xat (qirib ochiladi)",
  GALLERY: "Polaroid albom",
  HEARTS: "Yurak yomg'iri",
  QUIZ: "Viktorina",
};

const text = (max: number) => z.string().trim().max(max);

export const sceneDataSchemas = {
  STORY: z.object({
    lines: z.array(text(400)).max(50).default([]),
  }),
  WALL: z.object({
    notes: z.array(z.object({ text: text(300), author: text(60).default("") })).max(60).default([]),
  }),
  GIFT: z.object({
    message: text(600).default(""),
    balloonText: text(40).default(""),
    signature: text(60).default(""),
  }),
  SCRATCH: z.object({
    hidden: text(400).default(""),
    hint: text(120).default("Barmoq bilan suring"),
  }),
  GALLERY: z.object({
    photos: z.array(z.object({ src: z.string().trim().max(2000), caption: text(120).default("") })).max(30).default([]),
  }),
  HEARTS: z.object({
    target: z.coerce.number().int().min(1).max(200).default(20),
    message: text(400).default(""),
  }),
  QUIZ: z.object({
    questions: z
      .array(
        z.object({
          question: text(300),
          options: z.array(text(120)).min(2).max(4),
          answer: z.coerce.number().int().min(0).max(3),
        }),
      )
      .max(20)
      .default([]),
    reward: text(400).default(""),
  }),
} satisfies Record<SceneKind, z.ZodTypeAny>;

export type SceneData<K extends SceneKind = SceneKind> = z.infer<(typeof sceneDataSchemas)[K]>;

/** DB'dagi JSON satrni o'qish — yaroqsiz bo'lsa bo'sh (standart) qiymatlar. */
export function parseSceneData<K extends SceneKind>(kind: K, json: string): SceneData<K> {
  const schema = sceneDataSchemas[kind];
  try {
    return schema.parse(JSON.parse(json || "{}")) as SceneData<K>;
  } catch {
    return schema.parse({}) as SceneData<K>;
  }
}

/** Admin formasidan kelgan JSON — qat'iy tekshiruv (xato bo'lsa throw). */
export function validateSceneData(kind: SceneKind, json: string): string {
  return JSON.stringify(sceneDataSchemas[kind].parse(JSON.parse(json || "{}")));
}

/** Sahna "bo'sh"mi? Bo'shlari saytda ko'rsatilmaydi. */
export function isEmptyScene(kind: SceneKind, data: SceneData): boolean {
  switch (kind) {
    case "STORY":
      return !(data as SceneData<"STORY">).lines.some((l) => l.trim());
    case "WALL":
      return !(data as SceneData<"WALL">).notes.some((n) => n.text.trim());
    case "GIFT":
      return !(data as SceneData<"GIFT">).message.trim();
    case "SCRATCH":
      return !(data as SceneData<"SCRATCH">).hidden.trim();
    case "GALLERY":
      return !(data as SceneData<"GALLERY">).photos.some((p) => p.src.trim());
    case "HEARTS":
      return !(data as SceneData<"HEARTS">).message.trim();
    case "QUIZ":
      return (data as SceneData<"QUIZ">).questions.length === 0;
  }
}
