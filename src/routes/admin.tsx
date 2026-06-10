import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/Panel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · TAMV Core Kodex" },
      { name: "description", content: "Panel administrativo: consistencia de canon, hashes y contradicciones." },
    ],
  }),
  component: AdminLayout,
});

const ITEMS = [
  { to: "/admin/canon", label: "Canon Consistency" },
];

function AdminLayout() {
  const { location } = useRouterState();
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN · CONTROL"
        title="Panel administrativo"
        description="Operación interna del custodio: integridad canónica, hashes doctrinales y telemetría de ingesta."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[60vh]">
        <aside className="border-r border-border bg-sidebar/40 p-5 space-y-1">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-3">
            Secciones
          </div>
          {ITEMS.map((it) => {
            const active = location.pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "block rounded-sm px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </aside>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}