import { describe, expect, it } from "vitest";
import { parseInline, safeHref } from "@/lib/content/inline-markdown";
import { parseBlocks, readingMinutes, validateBlocksJson, youtubeEmbedUrl } from "@/lib/content/blocks";
import { pickTranslation } from "@/lib/content/translation";
import { format, matchLocale, toLocale } from "@/i18n";
import { slugify, isValidEmail } from "@/lib/utils";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";
import { signToken, verifyToken } from "@/lib/auth/token";
import { generateCode, generatePassword, hashSecret, verifySecret } from "@/lib/auth/password";

describe("inline markdown", () => {
  it("parses bold, italic, code, link", () => {
    expect(parseInline("a **b** *c* `d` [e](https://x.io)")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", children: [{ type: "text", value: "b" }] },
      { type: "text", value: " " },
      { type: "italic", children: [{ type: "text", value: "c" }] },
      { type: "text", value: " " },
      { type: "code", value: "d" },
      { type: "text", value: " " },
      { type: "link", href: "https://x.io", children: [{ type: "text", value: "e" }] },
    ]);
  });

  it("drops unsafe links", () => {
    expect(parseInline("[x](javascript:alert(1))")[0]).toMatchObject({ type: "text" });
    expect(safeHref("//evil.com")).toBeNull();
    expect(safeHref("/ok")).toBe("/ok");
  });
});

describe("blocks", () => {
  it("filters invalid blocks and survives bad json", () => {
    expect(parseBlocks("not json")).toEqual([]);
    const blocks = parseBlocks(JSON.stringify([{ type: "paragraph", text: "hi" }, { type: "nope" }]));
    expect(blocks).toEqual([{ type: "paragraph", text: "hi" }]);
  });

  it("strict validation throws on invalid input", () => {
    expect(() => validateBlocksJson('[{"type":"image"}]')).toThrow();
    expect(validateBlocksJson('[{"type":"image","src":"/a.webp"}]')).toContain('"layout":"center"');
  });

  it("reading time is at least 1 minute", () => {
    expect(readingMinutes([])).toBe(1);
    expect(readingMinutes([{ type: "paragraph", text: "w ".repeat(600) }])).toBe(3);
  });

  it("youtube embed only for youtube", () => {
    expect(youtubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toContain("dQw4w9WgXcQ");
    expect(youtubeEmbedUrl("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });
});

describe("i18n", () => {
  it("formats and matches locales", () => {
    expect(format("{n} min", { n: 3 })).toBe("3 min");
    expect(matchLocale("ru-RU,ru;q=0.9,en;q=0.8")).toBe("ru");
    expect(matchLocale("de-DE")).toBe("uz");
    expect(toLocale("xx")).toBe("uz");
  });

  it("picks translation with fallback", () => {
    const items = [{ locale: "en", t: 1 }, { locale: "ru", t: 2 }];
    expect(pickTranslation(items, "ru")?.t).toBe(2);
    expect(pickTranslation(items, "uz")?.t).toBe(1);
  });
});

describe("utils", () => {
  it("slugify handles latin, uzbek apostrophes and cyrillic", () => {
    expect(slugify("Salom, Dunyo!")).toBe("salom-dunyo");
    expect(slugify("O'zbekiston")).toBe("ozbekiston");
    expect(slugify("Привет мир")).toBe("privet-mir");
  });

  it("validates email", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("rate limits", () => {
    resetRateLimits();
    expect(rateLimit("k", 2, 1000, 0)).toBe(true);
    expect(rateLimit("k", 2, 1000, 1)).toBe(true);
    expect(rateLimit("k", 2, 1000, 2)).toBe(false);
    expect(rateLimit("k", 2, 1000, 1001)).toBe(true);
  });
});

describe("auth", () => {
  it("signs and verifies tokens per role", async () => {
    const token = await signToken({ sub: "a@b.co", role: "private" }, 60);
    expect(await verifyToken(token, "private")).toEqual({ sub: "a@b.co", role: "private" });
    expect(await verifyToken(token, "admin")).toBeNull();
    expect(await verifyToken(token + "x", "private")).toBeNull();
  });

  it("generates codes/passwords and hashes", async () => {
    expect(generateCode()).toMatch(/^\d{6}$/);
    expect(generatePassword()).toHaveLength(12);
    const hash = await hashSecret("123456");
    expect(await verifySecret("123456", hash)).toBe(true);
    expect(await verifySecret("000000", hash)).toBe(false);
  });
});
