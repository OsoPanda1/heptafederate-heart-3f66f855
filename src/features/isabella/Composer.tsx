import { useEffect, useRef, useState } from "react";
import { ArrowUp, Brain, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReasoningEffort } from "./types";

const EFFORTS: { value: ReasoningEffort; label: string }[] = [
  { value: "none", label: "Directo" },
  { value: "low", label: "Reflexivo" },
  { value: "medium", label: "Profundo" },
];

export function Composer({
  onSend,
  onStop,
  streaming,
  effort,
  onEffortChange,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  effort: ReasoningEffort;
  onEffortChange: (effort: ReasoningEffort) => void;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || streaming) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="border-t border-border bg-background/90 px-4 py-4 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-md border border-border bg-card/60 p-2 focus-within:border-primary/50">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Pregunta a Isabella sobre el kernel TAMV, EOCT, BookPI, federaciones…"
            aria-label="Mensaje para Isabella"
            className="max-h-[220px] w-full resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
          <div className="flex items-center justify-between gap-3 px-1 pt-1">
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Modo de razonamiento"
            >
              <Brain className="mr-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {EFFORTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onEffortChange(option.value)}
                  aria-pressed={effort === option.value}
                  className={cn(
                    "mono rounded-sm px-2 py-1 text-[10px] uppercase tracking-wider transition-colors",
                    effort === option.value
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background hover:border-destructive/60"
                aria-label="Detener la respuesta"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!value.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-opacity disabled:opacity-35"
                aria-label="Enviar mensaje"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <p className="mono mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
          Isabella puede equivocarse · verifica lo crítico contra BookPI y el canon
        </p>
      </div>
    </div>
  );
}
