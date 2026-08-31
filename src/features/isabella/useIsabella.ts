import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ISABELLA_STORAGE_KEY,
  type ChatMessage,
  type Conversation,
  type ReasoningEffort,
} from "./types";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function newConversation(): Conversation {
  const now = Date.now();
  return { id: uid(), title: "Nueva conversación", messages: [], createdAt: now, updatedAt: now };
}

function load(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ISABELLA_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Conversation[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useIsabella() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [effort, setEffort] = useState<ReasoningEffort>("low");
  const abortRef = useRef<AbortController | null>(null);

  // Hidratación diferida: evita mismatch de SSR con localStorage.
  useEffect(() => {
    const stored = load();
    if (stored.length > 0) {
      setConversations(stored);
      setActiveId(stored[0].id);
    } else {
      const fresh = newConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || conversations.length === 0) return;
    try {
      window.localStorage.setItem(
        ISABELLA_STORAGE_KEY,
        JSON.stringify(conversations.slice(0, 40)),
      );
    } catch {
      /* cuota agotada: la sesión sigue en memoria */
    }
  }, [conversations]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const patchActive = useCallback(
    (fn: (conversation: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...fn(c), updatedAt: Date.now() } : c)),
      );
    },
    [activeId],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const createConversation = useCallback(() => {
    stop();
    const fresh = newConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  }, [stop]);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = newConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const send = useCallback(
    async (text: string) => {
      const prompt = text.trim();
      if (!prompt || streaming || !active) return;

      const userMessage: ChatMessage = {
        id: uid(),
        role: "user",
        content: prompt,
        createdAt: Date.now(),
      };
      const assistantId = uid();
      const history = [...active.messages, userMessage];

      patchActive((c) => ({
        ...c,
        title:
          c.messages.length === 0
            ? prompt.slice(0, 56) + (prompt.length > 56 ? "…" : "")
            : c.title,
        messages: [
          ...history,
          { id: assistantId, role: "assistant", content: "", createdAt: Date.now() },
        ],
      }));

      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      const update = (patch: Partial<ChatMessage>) =>
        patchActive((c) => ({
          ...c,
          messages: c.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
        }));

      try {
        const response = await fetch("/api/isabella/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            reasoning: effort,
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok || !response.body) {
          const detail = (await response.json().catch(() => null)) as {
            error?: { code?: string };
          } | null;
          const code = detail?.error?.code ?? `ISABELLA_HTTP_${response.status}`;
          update({
            error:
              response.status === 429
                ? "Límite de peticiones alcanzado. Intenta de nuevo en unos segundos."
                : response.status === 402
                  ? "Créditos de IA agotados en el workspace. El propietario debe recargarlos."
                  : `Isabella no pudo responder (${code}).`,
          });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let content = "";
        let reasoning = "";
        let lastFlush = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            try {
              const evt = JSON.parse(trimmed.slice(5).trim()) as {
                type: string;
                text?: string;
              };
              if (evt.type === "delta" && evt.text) content += evt.text;
              else if (evt.type === "reasoning" && evt.text) reasoning += evt.text;
            } catch {
              /* fragmento parcial */
            }
          }

          const now = performance.now();
          if (now - lastFlush > 60) {
            update({ content, reasoning: reasoning || undefined });
            lastFlush = now;
          }
        }

        update({ content, reasoning: reasoning || undefined });
        if (!content.trim() && !reasoning.trim()) {
          update({ error: "Isabella devolvió una respuesta vacía." });
        }
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          update({ error: "Fallo de enlace con Isabella. Revisa tu conexión." });
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [active, effort, patchActive, streaming],
  );

  return {
    conversations,
    active,
    activeId,
    streaming,
    effort,
    setEffort,
    setActiveId,
    createConversation,
    deleteConversation,
    send,
    stop,
  };
}
