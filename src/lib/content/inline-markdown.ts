/**
 * Minimal inline markdown: **qalin**, *kursiv*, `kod`, [matn](url).
 * HTML qabul qilinmaydi — natija tokenlar, React ularni xavfsiz render qiladi (XSS yo'q).
 */
export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; children: InlineToken[] }
  | { type: "italic"; children: InlineToken[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: InlineToken[] }
  | { type: "br" };

const PATTERN = /(\*\*([^*]+?)\*\*)|(\*([^*\s][^*]*?)\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\(([^)\s]+)\))|(\n)/g;

export function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("#")) return trimmed;
  return null;
}

export function parseInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const m of input.matchAll(PATTERN)) {
    const index = m.index ?? 0;
    if (index > last) tokens.push({ type: "text", value: input.slice(last, index) });

    if (m[1]) tokens.push({ type: "bold", children: parseInline(m[2]) });
    else if (m[3]) tokens.push({ type: "italic", children: parseInline(m[4]) });
    else if (m[5]) tokens.push({ type: "code", value: m[6] });
    else if (m[7]) {
      const href = safeHref(m[9]);
      tokens.push(href ? { type: "link", href, children: parseInline(m[8]) } : { type: "text", value: m[8] });
    } else if (m[10]) tokens.push({ type: "br" });

    last = index + m[0].length;
  }
  if (last < input.length) tokens.push({ type: "text", value: input.slice(last) });
  return tokens;
}
