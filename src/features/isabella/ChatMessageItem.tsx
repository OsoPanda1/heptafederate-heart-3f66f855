import { useState } from "react";
import { AlertTriangle, Brain, Check, Copy, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";
import type { ChatMessage } from "./types";

export function ChatMessageItem({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* el portapapeles puede estar bloqueado por política del navegador */
    }
  };

  return (
    <article
      className={cn("group flex gap-4 px-5 py-6", isUser ? "bg-transparent" : "bg-card/40")}
      aria-label={isUser ? "Mensaje del usuario" : "Respuesta de Isabella"}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border",
          isUser
            ? "border-border bg-muted text-muted-foreground"
            : "border-primary/40 bg-gradient-to-br from-primary/30 to-accent/20 text-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mono mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{isUser ? "Tú" : "Isabella Villaseñor AI"}</span>
          {!isUser && message.reasoning && (
            <button
              type="button"
              onClick={() => setShowReasoning((v) => !v)}
              className="flex items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 text-[10px] hover:text-foreground"
              aria-expanded={showReasoning}
            >
              <Brain className="h-3 w-3" />
              {showReasoning ? "Ocultar razonamiento" : "Razonamiento"}
            </button>
          )}
        </div>

        {!isUser && message.reasoning && showReasoning && (
          <div className="mb-3 whitespace-pre-wrap rounded-sm border border-dashed border-border bg-background/60 p-3 text-xs text-muted-foreground">
            {message.reasoning}
          </div>
        )}

        {message.content ? (
          <Markdown text={message.content} />
        ) : streaming && !message.error ? (
          <div className="flex items-center gap-1.5" aria-label="Isabella está escribiendo">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/70"
                style={{ animationDelay: `${i * 140}ms` }}
              />
            ))}
          </div>
        ) : null}

        {message.error && (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{message.error}</span>
          </div>
        )}

        {!isUser && message.content && !streaming && (
          <button
            type="button"
            onClick={copy}
            className="mono mt-3 inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        )}
      </div>
    </article>
  );
}
