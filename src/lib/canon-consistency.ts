import { WIKIS, type WikiDoc } from "./wikis";

export interface CanonReportEntry {
  slug: string;
  title: string;
  repo: string;
  tags: string[];
  lines: number;
  hash: string;
  contentId: string;
}

export interface Contradiction {
  contentId: string;
  entries: CanonReportEntry[];
}

export interface Cluster {
  label: string;
  members: CanonReportEntry[];
}

export interface CanonReport {
  generatedAt: string;
  totalDocs: number;
  totalLines: number;
  entries: CanonReportEntry[];
  contradictions: Contradiction[];
  clusters: Cluster[];
}

async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function contentIdFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function entryFor(w: WikiDoc): Promise<CanonReportEntry> {
  const hash = await sha256Hex(w.body);
  return {
    slug: w.slug,
    title: w.title,
    repo: w.repo,
    tags: w.tags,
    lines: w.lines,
    hash,
    contentId: contentIdFromTitle(w.title.replace(/·.*$/, "").trim()),
  };
}

function detectContradictions(entries: CanonReportEntry[]): Contradiction[] {
  const groups = new Map<string, CanonReportEntry[]>();
  for (const e of entries) {
    const arr = groups.get(e.contentId) ?? [];
    arr.push(e);
    groups.set(e.contentId, arr);
  }
  const out: Contradiction[] = [];
  for (const [contentId, list] of groups) {
    if (list.length < 2) continue;
    const uniqueHashes = new Set(list.map((x) => x.hash));
    if (uniqueHashes.size > 1) out.push({ contentId, entries: list });
  }
  return out;
}

function buildClusters(entries: CanonReportEntry[]): Cluster[] {
  const tagMap = new Map<string, CanonReportEntry[]>();
  for (const e of entries) {
    for (const t of e.tags) {
      const arr = tagMap.get(t) ?? [];
      arr.push(e);
      tagMap.set(t, arr);
    }
  }
  return Array.from(tagMap.entries())
    .filter(([, members]) => members.length >= 2)
    .map(([label, members]) => ({ label, members }))
    .sort((a, b) => b.members.length - a.members.length);
}

export async function buildCanonReport(): Promise<CanonReport> {
  const entries = await Promise.all(WIKIS.map(entryFor));
  return {
    generatedAt: new Date().toISOString(),
    totalDocs: entries.length,
    totalLines: WIKIS.reduce((n, w) => n + w.lines, 0),
    entries: entries.sort((a, b) => a.title.localeCompare(b.title)),
    contradictions: detectContradictions(entries),
    clusters: buildClusters(entries),
  };
}