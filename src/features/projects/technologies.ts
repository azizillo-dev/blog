/** "Next.js, Go ,, next.js" → ["Next.js", "Go"] — bo'shlar va takrorlar (katta-kichik harfdan qat'i nazar) olib tashlanadi. */
export function parseTechnologies(input: string): string[] {
  const seen = new Set<string>();
  return input
    .split(",")
    .map((t) => t.trim())
    .filter((t) => {
      const key = t.toLowerCase();
      if (!t || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}
