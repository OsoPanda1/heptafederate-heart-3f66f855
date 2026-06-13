import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Boxes,
  CircleDot,
  Compass,
  FileText,
  Fingerprint,
  GitBranch,
  Globe2,
  LayoutDashboard,
  Network,
  Radar,
  ShieldCheck,
  Workflow,
  Atom,
  Database,
  Layers,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = typeof LayoutDashboard;

type NavItem = {
  to: string;
  label: string;
  icon: IconType;
  badge?: string;
};

const PRIMARY: NavItem[] = [
  { to: "/", label: "Kodex Home", icon: LayoutDashboard },
  { to: "/console", label: "Heptafederated Console", icon: Network, badge: "7" },
  { to: "/nexus", label: "Nexus Graph", icon: GitBranch },
  { to: "/atlas", label: "Atlas / Digital Twin", icon: Globe2 },
  { to: "/atlas/metasystem", label: "Metasystem Map", icon: Atom, badge: "new" },
  { to: "/unification", label: "Source Unification", icon: ShieldCheck, badge: "9" },
];

const ATLAS_CORE: NavItem[] = [
  { to: "/csp", label: "Atlas Core · CSP-α", icon: Atom, badge: "α" },
  { to: "/csp/ingestion", label: "Ingestion Engine", icon: Layers },
  { to: "/csp/canon", label: "Canon Registry", icon: Database },
  { to: "/csp/ontology", label: "Ontological Graph", icon: GitBranch },
  { to: "/csp/assembly", label: "Self-Assembly", icon: PackageCheck },
];

const RUNTIME: NavItem[] = [
  { to: "/eoct", label: "EOCT Runtime", icon: ShieldCheck },
  { to: "/korima", label: "Korima Engine", icon: Compass },
  { to: "/mdx5", label: "MD-X5 Orchestration", icon: Workflow },
  { to: "/events", label: "Event Stream", icon: Activity, badge: "live" },
];

const KNOWLEDGE: NavItem[] = [
  { to: "/docs", label: "Documentation OS", icon: BookOpen },
  { to: "/wikis", label: "Wikis Canónicas", icon: BookOpen, badge: "5" },
  { to: "/auth", label: "Identity Layer", icon: Fingerprint },
];

const ADMIN: NavItem[] = [
  { to: "/admin/canon", label: "Canon Consistency", icon: ShieldCheck },
];

type NavGroupProps = {
  title: string;
  items: NavItem[];
};

function isActivePath(currentPath: string, target: string): boolean {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

function NavGroup({ title, items }: NavGroupProps) {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  return (
    <section className="mb-6" aria-label={title}>
      <div className="mono mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {title}
      </div>
      <nav className="flex flex-col gap-px">
        {items.map((item) => {
          const active = isActivePath(currentPath, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                active && "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100",
                  active && "text-primary opacity-100",
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="mono rounded-sm bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}

function Sidebar() {
  return (
    <aside
      className="hidden w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/90 backdrop-blur md:flex"
      aria-label="Primary navigation"
    >
      <div className="border-b border-sidebar-border px-5 pb-6 pt-5">
        <Link to="/" className="flex items-start gap-3" aria-label="TAMV Core Kodex home">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-sidebar-border bg-gradient-to-br from-primary/30 to-accent/20">
            <Boxes className="h-4 w-4 text-foreground" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-success" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">TAMV Core Kodex</span>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Heptafederated v1.0
            </span>
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <NavGroup title="Sovereign Surface" items={PRIMARY} />
        <NavGroup title="Atlas Core™ · CSP-α" items={ATLAS_CORE} />
        <NavGroup title="Constitutional Runtime" items={RUNTIME} />
        <NavGroup title="Knowledge & Identity" items={KNOWLEDGE} />
        <NavGroup title="Admin" items={ADMIN} />
      </div>
      <div className="border-t border-sidebar-border px-5 py-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <CircleDot className="h-3 w-3 text-success" />
          <span className="mono uppercase tracking-wider">All federations operational</span>
        </div>
        <div className="mono mt-1 text-[10px] text-muted-foreground/70">
          custodio · edwin o. castillo trejo
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const { location } = useRouterState();
  const path = location.pathname;

  const crumbs =
    path === "/" ? ["Kodex", "Home"] : ["Kodex", ...path.split("/").filter(Boolean)];

  return (
    <header
      className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-border bg-background/80 px-5 backdrop-blur"
      aria-label="Global status bar"
    >
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={index} className="flex items-center gap-2">
              <span
                className={cn(
                  "mono uppercase tracking-wider",
                  isLast && "text-foreground",
                )}
              >
                {crumb}
              </span>
              {!isLast && <span className="opacity-40">/</span>}
            </span>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 text-xs">
        <div className="mono hidden items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground md:flex">
          <Radar className="h-3 w-3 text-success" />
          <span>HORUS · ANUBIS · OJO DE RA</span>
        </div>
        <div className="mono hidden items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground tabular lg:flex">
          <FileText className="h-3 w-3" />
          <span>DOI 10.5281/zenodo.19436662</span>
        </div>
        <div className="mono flex items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-success"
            aria-hidden="true"
          />
          <span aria-label="live status">LIVE</span>
        </div>
      </div>
    </header>
  );
}

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
