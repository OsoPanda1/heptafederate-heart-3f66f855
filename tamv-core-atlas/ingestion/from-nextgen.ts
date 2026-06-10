/**
 * Bridge: backend NextGen → Atlas ingestion.
 *
 * Lee artefactos JSON producidos por tamv-atlas-nextgen/backend (federation
 * reviews, bookpi blocks, knowledge consolidation reports) y los normaliza
 * como "fuentes externas" que el pipeline atlas puede absorber en el paso
 * normalize → classify → relate → publish.
 *
 * Salida: atlas/external/nextgen-*.json (consumidos por normalize.ts).
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const SRC = path.join(ROOT, "tamv-atlas-nextgen", "data");
const OUT = path.resolve(process.cwd(), "atlas", "external");

interface NextGenArtifact {
  source: string;
  kind: "federation-review" | "bookpi-block" | "knowledge-report" | "ops-cycle" | "config";
  ingestedAt: string;
  payload: unknown;
}

const KIND_MAP: Record<string, NextGenArtifact["kind"]> = {
  federation: "federation-review",
  bookpi: "bookpi-block",
  knowledge: "knowledge-report",
  ops: "ops-cycle",
  config: "config",
};

async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, acc);
    else if (e.isFile() && e.name.endsWith(".json")) acc.push(full);
  }
  return acc;
}

function classify(filePath: string): NextGenArtifact["kind"] {
  const rel = path.relative(SRC, filePath).split(path.sep);
  const bucket = rel[0] ?? "";
  return KIND_MAP[bucket] ?? "config";
}

async function main(): Promise<void> {
  await fs.mkdir(OUT, { recursive: true });
  const files = await walk(SRC);
  if (!files.length) {
    console.log(`[from-nextgen] no artifacts under ${SRC} — skipping bridge`);
    return;
  }

  let count = 0;
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const payload: unknown = JSON.parse(raw);
      const artifact: NextGenArtifact = {
        source: path.relative(ROOT, file),
        kind: classify(file),
        ingestedAt: new Date().toISOString(),
        payload,
      };
      const outName = path.relative(SRC, file).replace(/[\\/]/g, "_");
      await fs.writeFile(
        path.join(OUT, `nextgen-${outName}`),
        JSON.stringify(artifact, null, 2),
      );
      count += 1;
    } catch (err) {
      console.warn(`[from-nextgen] skipped ${file}: ${(err as Error).message}`);
    }
  }
  console.log(`[from-nextgen] bridged ${count} artifacts → ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error("[from-nextgen] fatal:", err);
  process.exit(1);
});