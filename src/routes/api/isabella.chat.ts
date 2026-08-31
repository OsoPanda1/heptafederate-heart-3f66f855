import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(24_000),
      }),
    )
    .min(1)
    .max(60),
  reasoning: z.enum(["none", "low", "medium"]).default("low"),
});

const SYSTEM_PROMPT = `Eres Isabella Villaseñor AI™, la inteligencia central del ecosistema TAMV Online (Kodex Heptafederado, custodio Edwin Oswaldo Castillo Trejo "Anubis Villaseñor").

Principios operativos (no negociables):
- La interfaz presenta; la API autoriza; el backend verifica; BookPI registra; el usuario conserva el control.
- Honestidad semántica: nunca afirmes que algo está "verificado", "auditado" o "live" si no puedes citar la fuente, el endpoint o la versión. Si un dato es documental o simulado, dilo explícitamente.
- Nunca produces contenido sexual, dependiente o manipulador. Eres soberanía cognitiva, no compañía emocional artificial.
- Respondes en el idioma del usuario (por defecto español), con precisión técnica y sin relleno.
- Usas markdown: encabezados cortos, listas, y bloques de código con lenguaje cuando aplique.

Dominio: kernel TAMV, EOCT, Korima, BookPI, Atlas Core CSP-α, MD-X5/X6, heptafederaciones, PQC, gobernanza constitucional.`;

export const Route = createFileRoute("/api/isabella/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { ok: false, error: { code: "ISABELLA_KEY_MISSING" } },
            { status: 500 },
          );
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return Response.json(
            { ok: false, error: { code: "ISABELLA_BAD_REQUEST" } },
            { status: 400 },
          );
        }

        const input = [
          { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
          ...parsed.messages.map((m) => ({
            role: m.role,
            content: [
              m.role === "assistant"
                ? { type: "output_text", text: m.content }
                : { type: "input_text", text: m.content },
            ],
          })),
        ];

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          signal: request.signal,
          body: JSON.stringify({
            model: "openai/gpt-5.6-sol",
            input,
            stream: true,
            store: false,
            ...(parsed.reasoning === "none"
              ? {}
              : { reasoning: { effort: parsed.reasoning, summary: "auto" } }),
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          return Response.json(
            {
              ok: false,
              error: {
                code: `ISABELLA_GATEWAY_${upstream.status}`,
                message: text.slice(0, 500),
              },
            },
            { status: upstream.status || 502 },
          );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = upstream.body.getReader();

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const emit = (payload: unknown) =>
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

            const { done, value } = await reader.read();
            if (done) {
              emit({ type: "done" });
              controller.close();
              return;
            }

            for (const line of decoder.decode(value, { stream: true }).split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const raw = trimmed.slice(5).trim();
              if (!raw || raw === "[DONE]") continue;
              try {
                const evt = JSON.parse(raw) as { type?: string; delta?: string };
                if (evt.type === "response.output_text.delta" && evt.delta) {
                  emit({ type: "delta", text: evt.delta });
                } else if (
                  evt.type === "response.reasoning_summary_text.delta" &&
                  evt.delta
                ) {
                  emit({ type: "reasoning", text: evt.delta });
                }
              } catch {
                /* fragmento parcial: ignorado */
              }
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
