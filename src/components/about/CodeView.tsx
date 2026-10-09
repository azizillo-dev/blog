import type { CodeFile } from "@/features/about/files";
import { highlightLine, type Tone } from "@/features/about/highlight";

const TONE: Record<Tone, string> = {
  plain: "text-[#d6deeb]",
  comment: "text-[#637777] italic",
  string: "text-[#addb67]",
  key: "text-[#82aaff]",
  keyword: "text-[#c792ea]",
  number: "text-[#f78c6c]",
  punct: "text-[#8b9bb4]",
};

/** Qator raqamlari bilan "kod" ko'rinishi. Ranglar — editor temasi, sayt mavzusiga bog'liq emas. */
export function CodeView({ file }: { file: CodeFile }) {
  return (
    <pre className="overflow-x-auto px-3 py-4 font-mono text-[13px] leading-relaxed sm:px-5 sm:text-sm">
      <code>
        {file.lines.map((line, i) => (
          <span key={i} className="grid grid-cols-[2.5rem_1fr]">
            <span className="select-none pr-3 text-right text-[#4b5a70]">{i + 1}</span>
            <span className="whitespace-pre-wrap break-words">
              {highlightLine(line, file.lang).map((token, k) => (
                <span key={k} className={TONE[token.tone]}>
                  {token.text}
                </span>
              ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
