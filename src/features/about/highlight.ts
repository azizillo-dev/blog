import type { CodeLang } from "./files";

export type Tone = "plain" | "comment" | "string" | "key" | "keyword" | "number" | "punct";
export type Token = { text: string; tone: Tone };

const KEYWORDS: Partial<Record<CodeLang, RegExp>> = {
  ts: /\b(export|const|as|satisfies|type|import|from|default)\b/,
  sql: /\b(SELECT|FROM|WHERE|ORDER BY|DESC|ASC|JOIN|LIMIT|GROUP BY)\b/,
  sh: /^(#!\/\S+|open|curl|cd|echo|cat|npm|git)\b/,
};

const COMMENT: Partial<Record<CodeLang, RegExp>> = {
  ts: /\/\/.*$/,
  sql: /--.*$/,
  sh: /#(?!!).*$/,
  md: /<!--[\s\S]*?-->/,
};

/**
 * Juda yengil "sintaksis bo'yash": bitta qatorni ranglangan bo'laklarga ajratadi.
 * Haqiqiy parser emas — IDE ko'rinishi uchun yetarli va 0 KB kutubxona.
 */
export function highlightLine(line: string, lang: CodeLang): Token[] {
  if (!line) return [{ text: "", tone: "plain" }];

  if (lang === "md") return markdownLine(line);

  const tokens: Token[] = [];
  let rest = line;

  // Izoh — qatorning oxirigacha
  const comment = COMMENT[lang]?.exec(rest);
  let trailing: Token | null = null;
  if (comment && comment.index >= 0) {
    trailing = { text: comment[0], tone: "comment" };
    rest = rest.slice(0, comment.index);
  }

  const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|[[\]{},:;()]|\s+)/;
  let buffer = rest;
  while (buffer.length > 0) {
    const match = pattern.exec(buffer);
    if (!match) {
      tokens.push(...word(buffer, lang));
      break;
    }
    if (match.index > 0) tokens.push(...word(buffer.slice(0, match.index), lang));
    const piece = match[0];
    const after = buffer.slice(match.index + piece.length);
    if (/^["']/.test(piece)) {
      // JSON kaliti: "key": ... ko'rinishida bo'lsa boshqa rangda
      tokens.push({ text: piece, tone: /^\s*:/.test(after) ? "key" : "string" });
    } else if (/^\d/.test(piece)) {
      tokens.push({ text: piece, tone: "number" });
    } else if (/^\s+$/.test(piece)) {
      tokens.push({ text: piece, tone: "plain" });
    } else {
      tokens.push({ text: piece, tone: "punct" });
    }
    buffer = after;
  }

  if (trailing) tokens.push(trailing);
  return tokens.length > 0 ? tokens : [{ text: line, tone: "plain" }];
}

function word(text: string, lang: CodeLang): Token[] {
  const kw = KEYWORDS[lang];
  if (!kw) return [{ text, tone: "plain" }];
  const match = kw.exec(text);
  if (!match) return [{ text, tone: "plain" }];
  const out: Token[] = [];
  if (match.index > 0) out.push({ text: text.slice(0, match.index), tone: "plain" });
  out.push({ text: match[0], tone: "keyword" });
  const tail = text.slice(match.index + match[0].length);
  if (tail) out.push(...word(tail, lang));
  return out;
}

function markdownLine(line: string): Token[] {
  if (/^#{1,6}\s/.test(line)) return [{ text: line, tone: "keyword" }];
  if (/^>\s?/.test(line)) return [{ text: line, tone: "string" }];
  const html = COMMENT.md?.exec(line);
  if (html && html.index === 0) return [{ text: line, tone: "comment" }];
  return [{ text: line, tone: "plain" }];
}
