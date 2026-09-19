import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const translateMany = vi.fn();
vi.mock("@/lib/translate", () => ({ translateMany: (...a: unknown[]) => translateMany(...a) }));

const { autoTranslate } = await import("@/features/admin/translate");

// Soxta tarjimon: har matn oldiga til kodini qo'yadi
const fake = async (texts: string[], _from: string, to: string) => texts.map((t) => (t ? `[${to}] ${t}` : t));

const blocks = JSON.stringify([
  { type: "heading", text: "Sarlavha", level: 2 },
  { type: "code", code: "npm run dev" },
  { type: "image", src: "https://x/y.webp", alt: "Rasm", caption: "Izoh", layout: "center" },
  { type: "gallery", images: [{ src: "https://x/a.webp", alt: "A" }, { src: "https://x/b.webp", alt: "" }] },
  { type: "paragraph", text: "Matn **qalin**" },
]);

describe("autoTranslate", () => {
  it("fills missing locales and translates only text inside blocks", async () => {
    translateMany.mockImplementation(fake);
    const { rows, translated, failed } = await autoTranslate([{ locale: "uz", title: "Salom", blocks }], ["title", "blocks"], {
      blockFields: ["blocks"],
    });
    expect(translated.sort()).toEqual(["en", "ru"]);
    expect(failed).toEqual([]);
    const ru = rows.find((r) => r.locale === "ru")!;
    expect(ru.title).toBe("[ru] Salom");
    const b = JSON.parse(ru.blocks);
    expect(b[0].text).toBe("[ru] Sarlavha");
    expect(b[1].code).toBe("npm run dev"); // kod tarjima qilinmaydi
    expect(b[2]).toMatchObject({ src: "https://x/y.webp", alt: "[ru] Rasm", caption: "[ru] Izoh" });
    expect(b[3].images.map((i: { alt: string }) => i.alt)).toEqual(["[ru] A", ""]);
    expect(b[4].text).toBe("[ru] Matn **qalin**");
  });

  it("keeps manually written translations unless overwrite", async () => {
    translateMany.mockImplementation(fake);
    const input = [
      { locale: "uz" as const, title: "Salom" },
      { locale: "ru" as const, title: "Привет (qo'lda)" },
    ];
    const kept = await autoTranslate(input, ["title"]);
    expect(kept.rows.find((r) => r.locale === "ru")!.title).toBe("Привет (qo'lda)");
    expect(kept.translated).toEqual(["en"]);

    const over = await autoTranslate(input, ["title"], { overwrite: true });
    expect(over.rows.find((r) => r.locale === "ru")!.title).toBe("[ru] Salom");
  });

  it("keeps the old translation when the service fails", async () => {
    translateMany.mockResolvedValue(null);
    const input = [
      { locale: "uz" as const, title: "Salom" },
      { locale: "en" as const, title: "Hello (old)" },
    ];
    const { rows, failed } = await autoTranslate(input, ["title"], { overwrite: true });
    expect(failed.sort()).toEqual(["en", "ru"]);
    expect(rows.map((r) => r.locale).sort()).toEqual(["en", "uz"]);
    expect(rows.find((r) => r.locale === "en")!.title).toBe("Hello (old)");
  });
});
