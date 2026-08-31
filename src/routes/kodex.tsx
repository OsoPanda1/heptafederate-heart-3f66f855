import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Cpu,
  Database,
  Fingerprint,
  Network,
  ShieldCheck,
} from "lucide-react";
import { PageHeader, Panel, Stat } from "@/components/common/Panel";
import { NexusGraph } from "@/components/nexus/NexusGraph";
import { EVENTS, FEDERATIONS, KPI, TOMOS } from "@/lib/tamv-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kodex")({
  head: () => ({
    meta: [
      { title: "Kodex Home · TAMV Core" },
      {
        name: "description",
        content:
          "Executive view of the TAMV heptafederated ecosystem: federations, kernels, system health and constitutional observability.",
      },
      { property: "og:title", content: "Kodex Home · TAMV Core" },
      {
        property: "og:description",
        content: "Sovereign operational console for the TAMV ecosystem.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const lastEvents = EVENTS.slice(0, 6);
  return (
    <div>
      <PageHeader
        eyebrow="KODEX · HOME · EXECUTIVE VIEW"
        title="TAMV Core Kodex — Heptafederated Sovereign Runtime"
        description="Monorepo canónico del ecosistema TAMV Online. Kernel constitucional, atlas civilizatorio, ciencia abierta y despliegue territorial en una sola superficie operativa, auditable y antifrágil."
      >
        <Link
          to="/console"
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-xs hover:bg-secondary transition-colors"
        >
          Open Console <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/nexus"
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Enter Nexus Graph
        </Link>
      </PageHeader>

      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat
            label="Repos canonizados"
            value={KPI.repos}
            delta="+12 / 24h"
            hint="Singularity ingest"
          />
          <Stat label="Federaciones" value={KPI.federations} hint="TAMV-K5 heptafederado" />
          <Stat label="Kernels activos" value={KPI.kernels} hint="OSO · MD-X5 · EOCT · Korima" />
          <Stat
            label="Artefactos científicos"
            value={KPI.artefacts.toLocaleString()}
            delta="+1.2k / 7d"
            hint="ORCID · Zenodo · Figshare"
          />
          <Stat label="Uptime constitucional" value={`${KPI.uptime}%`} hint="Horus · 90d ventana" />
          <Stat label="Trust score global" value={KPI.trust.toFixed(1)} hint="EOCT trust engine" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel
            eyebrow="NEXUS · LIVE TOPOLOGY"
            title="Knowledge graph del ecosistema TAMV"
            action={
              <Link
                to="/nexus"
                className="mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                EXPLORE →
              </Link>
            }
            className="xl:col-span-2"
            bodyClassName="p-0"
          >
            <NexusGraph height={460} />
          </Panel>

          <Panel
            eyebrow="EVENT STREAM · LIVE"
            title="Mission control feed"
            action={
              <Link
                to="/events"
                className="mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                ALL →
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {lastEvents.map((e) => (
                <li key={e.id} className="px-4 py-3 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn("mono text-[10px] uppercase tracking-wider", {
                        "text-success": e.level === "info",
                        "text-warning": e.level === "warn",
                        "text-destructive": e.level === "critical",
                        "text-accent": e.level === "audit",
                      })}
                    >
                      {e.level} · {e.source}
                    </span>
                    <span className="mono text-[10px] text-muted-foreground tabular">{e.ts}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground/85 leading-snug">{e.message}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel
          eyebrow="HEPTAFEDERATED · F1 → F7"
          title="Federations health overview"
          bodyClassName="p-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {FEDERATIONS.map((f) => (
              <Link
                key={f.id}
                to="/console"
                className="group border-r last:border-r-0 border-b xl:border-b-0 border-border p-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="mono text-[10px] uppercase tracking-wider"
                    style={{ color: f.accent }}
                  >
                    {f.code}
                  </span>
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", {
                      "bg-success": f.status === "operational",
                      "bg-warning": f.status === "watch",
                      "bg-destructive": f.status === "containment" || f.status === "degraded",
                    })}
                  />
                </div>
                <div className="mt-2 text-sm font-medium tracking-tight">{f.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {f.mandate}
                </div>
                <div className="mt-3 flex items-center gap-3 mono text-[10px] uppercase tracking-wider text-muted-foreground tabular">
                  <span>trust {f.trust}</span>
                  <span>risk {f.risk}</span>
                  <span>n {f.nodes}</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel eyebrow="KERNELS · CORE" title="Constitutional kernels online">
            <ul className="space-y-3 text-sm">
              {[
                {
                  icon: ShieldCheck,
                  name: "EOCT Constitutional Runtime",
                  meta: "ABAC · trust engine",
                },
                { icon: Cpu, name: "MD-X5 Orchestrator", meta: "pipelines · event sourcing" },
                { icon: Network, name: "OSO Data Weaver", meta: "federation kernel" },
                { icon: Database, name: "BookPI Ledger", meta: "atlas · DOI batch" },
                { icon: Activity, name: "Horus / Anubis Sentinels", meta: "observabilidad" },
                { icon: Fingerprint, name: "Identity Ledger", meta: "ORCID · sovereign creds" },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <li key={k.name} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-sm border border-border bg-secondary/40 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{k.name}</div>
                      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {k.meta}
                      </div>
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel eyebrow="TOMOS · CANON" title="Compendio civilizatorio">
            <ul className="space-y-2.5">
              {TOMOS.map((t) => (
                <li key={t.id} className="flex items-start gap-3 text-sm">
                  <span className="mono text-[10px] uppercase tracking-wider text-accent w-8 shrink-0 pt-0.5">
                    {t.number}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">
                      {t.summary}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel eyebrow="TIMELINE · ECOSYSTEM" title="Hitos canónicos">
            <ol className="relative border-l border-border pl-5 space-y-4">
              {[
                {
                  t: "2024 Q1",
                  title: "Génesis ADN Anubis",
                  body: "Manifiesto Isabella Villaseñor IA · ICIL definido.",
                },
                {
                  t: "2024 Q3",
                  title: "Singularity v0",
                  body: "Absorción inicial de 78 repos en monorepo Kodex.",
                },
                {
                  t: "2025 Q1",
                  title: "Heptafederación TAMV-K5",
                  body: "Siete federaciones canonizadas y operativas.",
                },
                {
                  t: "2025 Q4",
                  title: "BookPI Ledger",
                  body: "Columna vertebral de eventos y DOI batch.",
                },
                {
                  t: "2026 Q1",
                  title: "EOCT Runtime v1",
                  body: "Constitutional ABAC + Lightning Justice.",
                },
                {
                  t: "2026 Q2",
                  title: "Kodex v1.0",
                  body: "209 repos canonizados · launch institucional.",
                },
              ].map((m, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                  <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.t}
                  </div>
                  <div className="text-sm text-foreground">{m.title}</div>
                  <div className="text-[11px] text-muted-foreground">{m.body}</div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
