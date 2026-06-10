import { createFileRoute, Link, Outlet, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PageHeader } from "@/components/common/Panel";
import { WIKIS, ALL_TAGS, searchWikis, type WikiDoc } from "@/lib/wikis";
import { cn } from "@/lib/utils";

const wikisSearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tag: fallback(z.string().nullable(), null).default(null),
});

export const Route = createFileRoute("/wikis")({
  validateSearch: zodValidator(wikisSearchSchema),
  head: () => ({
    meta: [
      { title: "Wikis Canónicas · TAMV Core Kodex" },
      {
        name: "description",
        content:
          "Wikis canónicas del ecosistema TAMV con búsqueda fulltext, tags y deep-links compartibles.",
      },
      { property: "og:title", content: "Wikis Canónicas · TAMV" },
      { property: "og:description", content: "Seed canónico de wikis del ecosistema TAMV." },
    ],
  }),
  component: WikisPage,
});

function WikisPage() {
  const location = useLocation();
  const { q, tag } = useSearch({ from: "/wikis" });
  const navigate = useNavigate({ from: "/wikis" });
  const onLeaf = location.pathname !== "/wikis";

  const filtered = useMemo(() => searchWikis(q, tag), [q, tag]);
  const grouped = useMemo(() => {
    const map = new Map<string, WikiDoc[]>();
    for (const w of filtered) {
      const arr = map.get(w.repo) ?? [];
      arr.push(w);
      map.set(w.repo, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <PageHeader
        eyebrow="DOCUMENTATION · WIKIS"
        title="Wikis canónicas ingestadas"
        description={`${WIKIS.length} documentos · ${WIKIS.reduce((n, w) => n + w.lines, 0).toLocaleString()} líneas · búsqueda fulltext, tags y deep-links.`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[60vh]">
        <aside className="border-r border-border bg-sidebar/40 p-5 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          <input
            type="search"
            value={q}
            onChange={(e) =>
              navigate({ search: (prev) => ({ ...prev, q: e.target.value }) })
            }
            placeholder="Buscar en wikis…"
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40"
          />

          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">
              Tags
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => navigate({ search: (prev) => ({ ...prev, tag: null }) })}
                className={cn(
                  "mono text-[10px] uppercase px-2 py-1 rounded-sm border",
                  !tag
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                todos
              </button>
              {ALL_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    navigate({ search: (prev) => ({ ...prev, tag: prev.tag === t ? null : t }) })
                  }
                  className={cn(
                    "mono text-[10px] uppercase px-2 py-1 rounded-sm border",
                    tag === t
                      ? "border-foreground text-foreground bg-secondary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Resultados · {filtered.length} / {WIKIS.length}
          </div>

          <div className="space-y-3">
            {grouped.map(([repo, items]) => (
              <div key={repo}>
                <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
                  {repo}
                </div>
                {items.map((w) => {
                  const active = location.pathname === `/wikis/${w.slug}`;
                  return (
                    <Link
                      key={w.slug}
                      to="/wikis/$slug"
                      params={{ slug: w.slug }}
                      className={cn(
                        "block rounded-sm px-2.5 py-2 transition-colors",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                      )}
                    >
                      <div className="text-sm font-medium">{w.title}</div>
                      <div className="mono text-[10px] text-muted-foreground/70 mt-0.5">
                        {w.lines.toLocaleString()} líneas · {w.tags.slice(0, 3).join(" · ")}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-muted-foreground px-2">
                Sin resultados. Limpia filtros.
              </div>
            )}
          </div>
        </aside>
        <div className="p-8">{onLeaf ? <Outlet /> : <WikisIndex filtered={filtered} />}</div>
      </div>
    </div>
  );
}

function WikisIndex({ filtered }: { filtered: WikiDoc[] }) {
  return (
    <article className="max-w-3xl">
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        WIKIS · INDEX
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {filtered.length} wikis disponibles
      </h1>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Usa el buscador o los tags del lateral para filtrar. Los deep-links
        <code className="mono mx-1 px-1 bg-secondary rounded text-[10px]">/wikis?q=...&tag=...</code>
        son compartibles.
      </p>
      <div className="mt-6 grid gap-3">
        {filtered.map((w) => (
          <Link
            key={w.slug}
            to="/wikis/$slug"
            params={{ slug: w.slug }}
            className="block rounded-sm border border-border p-4 hover:border-foreground/40 transition-colors"
          >
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {w.repo}
            </div>
            <div className="mt-1 font-medium">{w.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{w.description}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {w.tags.map((t) => (
                <span key={t} className="mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}