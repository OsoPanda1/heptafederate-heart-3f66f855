import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { marked } from "marked";
import { useMemo } from "react";
import { getWiki, relatedWikis, WIKIS } from "@/lib/wikis";

export const Route = createFileRoute("/wikis/$slug")({
  head: ({ params }) => {
    const w = getWiki(params.slug);
    return {
      meta: [
        { title: `${w?.title ?? params.slug} · Wiki TAMV` },
        { name: "description", content: w?.description ?? "Wiki canónica TAMV." },
        { property: "og:title", content: w?.title ?? params.slug },
        { property: "og:description", content: w?.description ?? "Wiki canónica TAMV." },
      ],
    };
  },
  loader: ({ params }) => {
    if (!getWiki(params.slug)) throw notFound();
    return null;
  },
  notFoundComponent: () => (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Wiki no encontrada</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Slugs disponibles: {WIKIS.map((w) => w.slug).join(", ")}
      </p>
      <Link to="/wikis" className="mono text-[10px] uppercase mt-4 inline-block">
        ← Volver
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Error renderizando wiki</h1>
      <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{String(error)}</pre>
    </div>
  ),
  component: WikiEntry,
});

marked.setOptions({ gfm: true, breaks: false });

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

function extractToc(body: string): TocEntry[] {
  const out: TocEntry[] = [];
  const lines = body.split("\n");
  let inFence = false;
  for (const line of lines) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const level = m[1].length as 2 | 3;
      const text = m[2].trim();
      out.push({ level, text, id: slugify(text) });
    }
  }
  return out.slice(0, 60);
}

function addHeadingIds(html: string): string {
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, lvl, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const id = slugify(text);
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });
}

function WikiEntry() {
  const { slug } = Route.useParams();
  const wiki = getWiki(slug)!;
  const html = useMemo(
    () => addHeadingIds(marked.parse(wiki.body) as string),
    [wiki.body],
  );
  const toc = useMemo(() => extractToc(wiki.body), [wiki.body]);
  const related = useMemo(() => relatedWikis(slug), [slug]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8 max-w-6xl">
      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Link to="/wikis" className="hover:text-foreground">Wikis</Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground truncate">{wiki.title}</span>
        </nav>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-4">
          {wiki.repo}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{wiki.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{wiki.description}</p>
        <div className="mono text-[10px] text-muted-foreground/70 mt-2 flex flex-wrap gap-2">
          <span>{wiki.lines.toLocaleString()} líneas</span>
          <span>·</span>
          {wiki.tags.map((t) => (
            <Link
              key={t}
              to="/wikis"
              search={{ q: "", tag: t }}
              className="uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground"
            >
              {t}
            </Link>
          ))}
        </div>
        <div
          className="prose prose-invert prose-sm mt-8 max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:scroll-mt-20
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
            prose-a:text-foreground prose-a:underline-offset-4
            prose-code:text-foreground prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-secondary prose-pre:border prose-pre:border-border
            prose-table:text-xs prose-th:border prose-td:border prose-th:px-2 prose-td:px-2
            prose-blockquote:border-l-foreground/30"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {related.length > 0 && (
          <section className="mt-12 border-t border-border pt-6">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              WIKIS RELACIONADAS
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/wikis/$slug"
                  params={{ slug: r.slug }}
                  className="block rounded-sm border border-border p-3 hover:border-foreground/40"
                >
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="mono text-[10px] text-muted-foreground/70 mt-1">
                    {r.tags.slice(0, 3).join(" · ")}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="mt-10">
          <Link
            to="/wikis"
            className="mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ← Wikis canónicas
          </Link>
        </div>
      </article>
      {toc.length > 0 && (
        <aside className="hidden lg:block">
          <div className="sticky top-16 border-l border-border pl-4">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">
              En esta wiki
            </div>
            <nav className="space-y-1 text-xs">
              {toc.map((t, i) => (
                <a
                  key={`${t.id}-${i}`}
                  href={`#${t.id}`}
                  className={`block text-muted-foreground hover:text-foreground truncate ${t.level === 3 ? "pl-3" : ""}`}
                >
                  {t.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}