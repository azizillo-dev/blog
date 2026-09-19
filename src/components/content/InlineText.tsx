import { Fragment } from "react";
import { parseInline, type InlineToken } from "@/lib/content/inline-markdown";

function render(tokens: InlineToken[]): React.ReactNode {
  return tokens.map((t, i) => {
    switch (t.type) {
      case "text":
        return <Fragment key={i}>{t.value}</Fragment>;
      case "bold":
        return <strong key={i}>{render(t.children)}</strong>;
      case "italic":
        return <em key={i}>{render(t.children)}</em>;
      case "code":
        return <code key={i}>{t.value}</code>;
      case "br":
        return <br key={i} />;
      case "link": {
        const external = /^https?:/i.test(t.href);
        return (
          <a key={i} href={t.href} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
            {render(t.children)}
          </a>
        );
      }
    }
  });
}

export function InlineText({ text }: { text: string }) {
  return <>{render(parseInline(text))}</>;
}
