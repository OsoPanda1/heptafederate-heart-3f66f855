import { useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renderiza markdown con saneado defensivo de HTML embebido. */
export function Markdown({ text }: { text: string }) {
  const html = useMemo(() => marked.parse(escapeHtml(text)) as string, [text]);

  return (
    <div
      className="isabella-prose text-[15px] leading-relaxed text-foreground/90"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
