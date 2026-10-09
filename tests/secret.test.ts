import { describe, expect, it } from "vitest";
import { isEmptyScene, parseSceneData, validateSceneData, type SceneData } from "@/features/secret/schema";

describe("secret scenes", () => {
  it("falls back to empty data when JSON is broken", () => {
    expect(parseSceneData("STORY", "{ buzuq")).toEqual({ lines: [] });
    expect(parseSceneData("HEARTS", "")).toEqual({ target: 20, message: "" });
  });

  it("keeps valid data and trims text", () => {
    const data = parseSceneData("WALL", JSON.stringify({ notes: [{ text: "  Salom  ", author: "A" }] }));
    expect(data.notes).toEqual([{ text: "Salom", author: "A" }]);
  });

  it("rejects invalid admin input", () => {
    expect(() => validateSceneData("QUIZ", JSON.stringify({ questions: [{ question: "?", options: ["bitta"], answer: 0 }] }))).toThrow();
    expect(() => validateSceneData("HEARTS", JSON.stringify({ target: 0, message: "x" }))).toThrow();
  });

  it("detects empty scenes so they are hidden on the site", () => {
    expect(isEmptyScene("GIFT", parseSceneData("GIFT", "{}"))).toBe(true);
    expect(isEmptyScene("GIFT", parseSceneData("GIFT", JSON.stringify({ message: "Sevgi" })))).toBe(false);
    expect(isEmptyScene("STORY", { lines: ["", "  "] } as SceneData<"STORY">)).toBe(true);
  });
});
