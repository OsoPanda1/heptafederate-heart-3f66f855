import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Panel } from "@/components/common/Panel";
import { buildCanonReport, type CanonReport } from "@/lib/canon-consistency";

export const Route = createFileRoute("/admin/canon")({
  head: () => ({
    meta: [
      { title: "Canon Consistency · Admin · TAMV" },
      { name: "description", content: "Reporte automático de consistencia de canon: hashes SHA-256, contradicciones doctrinales y clusters." },
    ],
  }),
  component: CanonConsistencyPage,
});

function CanonConsistencyPage() {
  const [report, setReport] = useState<CanonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    buildCanonReport().then((r) => {
      if (!cancelled) {
        setReport(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  if (loading || !report) {
    return <div className="mono text-xs text-muted-foreground">Calculando hashes SHA-256…</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            CANON REPORT
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Consistencia doctrinal — {report.totalDocs} docs · {report.totalLines.toLocaleString()} líneas
          </h2>
          <div className="mono text-[10px] text-muted-foreground/70 mt-1">
            generado {new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => setNonce((n) => n + 1)}
          className="mono text-[11px] uppercase tracking-wider border border-border rounded-sm px-3 py-1.5 hover:bg-secondary"
        >
          Re-escanear
        </button>
      </div>

      <Panel
        eyebrow="ALERTAS"
        title={`Contradicciones doctrinales · ${report.contradictions.length}`}
      >
        {report.contradictions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            ✓ Sin contradicciones. Ningún contentId tiene hashes divergentes.
          </div>
        ) : (
          <ul className="space-y-3">
            {report.contradictions.map((c) => (
              <li
                key={c.contentId}
                className="rounded-sm border border-destructive/40 bg-destructive/5 p-3"
              >
                <div className="mono text-[10px] uppercase tracking-wider text-destructive">
                  contentId: {c.contentId}
                </div>
                <div className="mt-2 space-y-1">
                  {c.entries.map((e) => (
                    <div key={e.slug} className="flex justify-between gap-3 text-xs">
                      <span>{e.title}</span>
                      <span className="mono text-muted-foreground">{e.hash.slice(0, 12)}…</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel eyebrow="HASHES" title="Registro SHA-256 por documento canónico">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left mono uppercase text-[10px] tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Documento</th>
                <th className="py-2 pr-3">Repo</th>
                <th className="py-2 pr-3">Líneas</th>
                <th className="py-2 pr-3">Tags</th>
                <th className="py-2">Hash</th>
              </tr>
            </thead>
            <tbody>
              {report.entries.map((e) => (
                <tr key={e.slug} className="border-b border-border/40">
                  <td className="py-2 pr-3">{e.title}</td>
                  <td className="py-2 pr-3 mono text-[10px] text-muted-foreground">{e.repo}</td>
                  <td className="py-2 pr-3 tabular">{e.lines.toLocaleString()}</td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {e.tags.map((t) => (
                        <span key={t} className="mono text-[9px] uppercase px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 mono text-[10px] text-muted-foreground">
                    {e.hash.slice(0, 16)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel eyebrow="CONVERGENCIA" title={`Clusters por solapamiento de tags · ${report.clusters.length}`}>
        <div className="grid gap-2 sm:grid-cols-2">
          {report.clusters.map((c) => (
            <div key={c.label} className="rounded-sm border border-border p-3">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.label} · {c.members.length} docs
              </div>
              <ul className="mt-2 space-y-0.5">
                {c.members.map((m) => (
                  <li key={m.slug} className="text-xs truncate">
                    · {m.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}