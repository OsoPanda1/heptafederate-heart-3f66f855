import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "./types";

export function ConversationRail({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside
      className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-card/30 lg:flex"
      aria-label="Historial de conversaciones"
    >
      <div className="border-b border-border p-3">
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-muted"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva conversación
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={cn(
              "group flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors",
              c.id === activeId
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              aria-current={c.id === activeId ? "true" : undefined}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
              <span className="truncate">{c.title}</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              aria-label={`Eliminar ${c.title}`}
              className="opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mono border-t border-border px-3 py-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
        historial local · sin servidor
      </div>
    </aside>
  );
}
