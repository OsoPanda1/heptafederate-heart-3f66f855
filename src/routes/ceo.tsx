import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Database,
  ExternalLink,
  Fingerprint,
  Globe2,
  GraduationCap,
  Landmark,
  Layers,
  Microscope,
  Network,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader, Panel, Stat } from "@/components/common/Panel";

const PIDS = {
  ORCID: "0009-0008-5050-1539",
  DOI: "10.5281/zenodo.19436662",
  VERSION: "TAMV-MD-X4-CORE",
} as const;

type DirectoryEntry = {
  key: string;
  label: string;
  value: string;
  href: string;
  icon: typeof Database;
  hint: string;
};

const DIRECTORY: DirectoryEntry[] = [
  {
    key: "orcid",
    label: "ORCID",
    value: PIDS.ORCID,
    href: `https://orcid.org/${PIDS.ORCID}`,
    icon: Fingerprint,
    hint: "Identidad académica única y trazable.",
  },
  {
    key: "zenodo",
    label: "Zenodo · DOI",
    value: PIDS.DOI,
    href: `https://doi.org/${PIDS.DOI}`,
    icon: Database,
    hint: "Dataset, código y artefactos reproducibles.",
  },
  {
    key: "figshare",
    label: "Figshare",
    value: "figshare.com",
    href: "https://figshare.com/authors/Edwin_Oswaldo_Castillo_Trejo",
    icon: Layers,
    hint: "Modelos 3D, dashboards y recursos visuales abiertos.",
  },
  {
    key: "openaire",
    label: "OpenAIRE",
    value: "explore.openaire.eu",
    href: "https://explore.openaire.eu",
    icon: Globe2,
    hint: "Visibilidad europea y cumplimiento de políticas abiertas.",
  },
  {
    key: "datacite",
    label: "DataCite",
    value: "datacite.org",
    href: "https://datacite.org",
    icon: ShieldCheck,
    hint: "DOI persistente y metadatos enlazados FAIR.",
  },
  {
    key: "loops",
    label: "Loops",
    value: "loops.academy",
    href: "https://loop.frontiersin.org",
    icon: Network,
    hint: "Red de colaboración y trazabilidad de versiones.",
  },
  {
    key: "frontiers",
    label: "Frontiers",
    value: "frontiersin.org",
    href: "https://www.frontiersin.org",
    icon: GraduationCap,
    hint: "Publicación con revisión por pares en IA y sistemas.",
  },
  {
    key: "avixa",
    label: "AVIXA",
    value: "avixa.org",
    href: "https://www.avixa.org",
    icon: Award,
    hint: "Estándares de experiencias audiovisuales inmersivas.",
  },
  {
    key: "xcange",
    label: "XCANGE",
    value: "xcange.io",
    href: "https://xcange.io",
    icon: Sparkles,
    hint: "Interoperabilidad de activos digitales phygital.",
  },
];

const COMPETENCIES = [
  {
    title: "Arquitectura federada",
    body: "Plataformas distribuidas, microservicios resilientes y topologías orientadas a privacidad y soberanía.",
  },
  {
    title: "IA cuántica-emocional",
    body: "Kernels híbridos simbólico–subsimbólicos, agentes autónomos y razonamiento afectivo (Isabella AI).",
  },
  {
    title: "Metaverso 4D y gemelos digitales",
    body: "Modelado poligonal de alta fidelidad, persistencia sensorial y sincronización spatio-temporal para Smart Destinations.",
  },
  {
    title: "Gobernanza de datos",
    body: "Knowledge graphs, ontologías, BookPI (libro inmutable) y protocolos de integridad inmanente.",
  },
  {
    title: "Seguridad y auditoría",
    body: "Hardening de pilas federadas, control de llaves, transparencia y auditoría reproducible end-to-end.",
  },
  {
    title: "Liderazgo y comunidad",
    body: "Dirección de equipos multidisciplinares, publicación académica y posicionamiento de proyectos open-source.",
  },
];

const PROJECTS = [
  {
    name: "Isabella AI Kernel",
    blurb: "Núcleo de IA cuántica-emocional para gestión inteligente y simulación territorial.",
    icon: Sparkles,
  },
  {
    name: "DM-X4 / DM-X5 Dashboards",
    blurb: "Interfaces de control cuántico-operativas para coordinación de recursos y respuesta territorial.",
    icon: Layers,
  },
  {
    name: "RDM Digital",
    blurb: "Plataforma de datos, repositorios y visualización para preservación de patrimonio y metadatos.",
    icon: Database,
  },
  {
    name: "TAMV Online Network 4D™",
    blurb: "Plataforma federada de metaverso sensorial orientada a Smart Destinations y economía local.",
    icon: Globe2,
  },
  {
    name: "Operation Sovereignty 100",
    blurb: "Despliegue estratégico de 100 nodos de soberanía digital en comunidades piloto LATAM.",
    icon: ShieldCheck,
  },
  {
    name: "CITEMESH Federation",
    blurb: "Topología de células federadas para gobernanza local y cooperación inter-territorial.",
    icon: Network,
  },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Edwin Oswaldo Castillo Trejo",
    alternateName: "Anubis Villaseñor",
    jobTitle: "Chief Executive Officer & Lead Systems Architect",
    affiliation: {
      "@type": "Organization",
      name: "TAMV Online Network | RDM Digital",
      address: "Real del Monte, Hidalgo, México",
    },
    identifier: [
      { "@type": "PropertyValue", propertyID: "ORCID", value: PIDS.ORCID },
      { "@type": "PropertyValue", propertyID: "DOI", value: PIDS.DOI },
    ],
    sameAs: DIRECTORY.map((d) => d.href),
    knowsAbout: [
      "Soberanía digital",
      "Metaverso 4D",
      "Gemelos digitales",
      "IA cuántica-emocional",
      "Smart Destinations",
      "Knowledge graphs",
      "Real del Monte",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const Route = createFileRoute("/ceo")({
  head: () => ({
    meta: [
      {
        title:
          "CEO · Edwin O. Castillo Trejo (Anubis Villaseñor) — TAMV Online Network",
      },
      {
        name: "description",
        content:
          "Arquitecto de sistemas y CEO de TAMV Online Network. Soberanía digital, metaverso 4D, Isabella AI. ORCID 0009-0008-5050-1539 · DOI 10.5281/zenodo.19436662.",
      },
      { name: "author", content: "Edwin Oswaldo Castillo Trejo" },
      { name: "orcid", content: PIDS.ORCID },
      { name: "doi", content: PIDS.DOI },
      {
        property: "og:title",
        content: "Edwin O. Castillo Trejo · CEO TAMV Online Network",
      },
      {
        property: "og:description",
        content:
          "Soberanía digital LATAM · Isabella AI Kernel · DM-X4/X5 · RDM Digital · 7 Federations.",
      },
      { property: "og:type", content: "profile" },
    ],
    links: [{ rel: "me", href: `https://orcid.org/${PIDS.ORCID}` }],
  }),
  component: CeoPage,
});

function CeoPage() {
  return (
    <div>
      <JsonLd />
      <PageHeader
        eyebrow="CUSTODIO CANÓNICO · OFFICE OF THE CEO"
        title="Edwin Oswaldo Castillo Trejo — Anubis Villaseñor"
        description="Chief Executive Officer & Lead Systems Architect · TAMV Online Network | RDM Digital. Real del Monte, Hidalgo, México."
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="ORCID" value={PIDS.ORCID} hint="Identidad académica" />
          <Stat label="Zenodo DOI" value={PIDS.DOI} hint="Dataset canónico" />
          <Stat label="Versión Canon" value={PIDS.VERSION} />
          <Stat label="Federaciones" value={7} delta="operacionales" />
        </div>

        <Panel
          eyebrow="BIOGRAFÍA · RESUMEN PROFESIONAL"
          title="Arquitecto de infraestructuras soberanas para LATAM"
        >
          <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
            <p>
              Edwin Oswaldo Castillo Trejo es arquitecto de sistemas, investigador
              independiente y promotor pionero de infraestructuras digitales soberanas
              en América Latina. Con base en{" "}
              <strong>Real del Monte, Hidalgo (México)</strong>, lidera{" "}
              <strong>TAMV Online Network</strong> como CEO y arquitecto principal, donde
              diseña y opera ecosistemas digitales autoconscientes orientados a metaversos
              inmersivos 4D, sistemas distribuidos y arquitecturas avanzadas de
              Inteligencia Artificial.
            </p>
            <p>
              Dirige la ingeniería del <strong>Isabella AI Kernel</strong> (IA
              cuántica-emocional) y la interfaz de control <strong>DM-X4</strong> (Quantum
              Control Interface), concebidos como núcleos cognitivos y operativos para la
              gestión inteligente del territorio y la transformación digital ética.
              Promueve el modelo de gobernanza <strong>"7 Federations"</strong>, una
              arquitectura sociotécnica que integra identidad cultural mexicana, soberanía
              tecnológica y economías locales resilientes.
            </p>
            <p>
              Su trabajo combina rigor académico, ingeniería de software y estrategias de
              gobierno cívico-digital para construir infraestructuras autónomas{" "}
              <em>"Made in Mexico"</em> que sirvan de plataforma replicable para la
              soberanía digital en LATAM.
            </p>
          </div>
        </Panel>

        <Panel
          eyebrow="PERSISTENT IDENTIFIERS · ACADEMIC INFRASTRUCTURE"
          title="Directorio canónico de identidad y publicación"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIRECTORY.map((entry) => {
              const Icon = entry.icon;
              return (
                <a
                  key={entry.key}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 rounded-sm border border-border bg-secondary/30 p-4 transition hover:border-accent hover:bg-secondary/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-card">
                        <Icon className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {entry.label}
                      </span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div className="mono text-xs text-foreground">{entry.value}</div>
                  <div className="text-xs text-muted-foreground">{entry.hint}</div>
                </a>
              );
            })}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            eyebrow="COMPETENCIES · ENGINEERING"
            title="Competencias técnicas principales"
          >
            <ul className="space-y-3 text-sm">
              {COMPETENCIES.map((c) => (
                <li
                  key={c.title}
                  className="border-l-2 border-accent/60 pl-3"
                >
                  <div className="font-medium text-foreground">{c.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.body}</div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            eyebrow="KEY PROJECTS · ACTIVE PORTFOLIO"
            title="Proyectos canónicos y contribuciones"
          >
            <ul className="space-y-3 text-sm">
              {PROJECTS.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.name} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-secondary/40">
                      <Icon className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.blurb}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <Panel
          eyebrow="RESEARCH LINES · AREAS ACTIVAS"
          title="Ámbitos de investigación"
        >
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {[
              "IA cuántica-emocional y toma de decisiones afectiva",
              "Agentes autónomos y arquitectura distribuida para gobernanza local",
              "Metadatos persistentes y enlazados para patrimonios culturales digitales",
              "Digitalización territorial: Smart Destinations y ecologías phygital",
              "Economías circulares integradas a plataformas federadas",
              "Interoperabilidad ORCID · DOI · DataCite · OpenAIRE",
            ].map((line) => (
              <div
                key={line}
                className="flex items-start gap-2 rounded-sm border border-border bg-secondary/20 p-3"
              >
                <Microscope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="text-foreground/90">{line}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          eyebrow="AFFILIATIONS · ROLES"
          title="Filiaciones y posicionamiento"
        >
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <Landmark className="h-4 w-4 text-accent" />
              <span>
                <strong>CEO & Lead Systems Architect</strong>, TAMV Online Network.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Landmark className="h-4 w-4 text-accent" />
              <span>
                <strong>Fundador / Director técnico</strong>, RDM Digital.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-accent" />
              <span>
                Mentor en proyectos de soberanía digital e incubadoras tecnológicas
                regionales.
              </span>
            </li>
          </ul>
        </Panel>

        <Panel
          eyebrow="CITA CANÓNICA"
          title="Manifiesto de trabajo"
        >
          <blockquote className="flex gap-4 border-l-2 border-accent pl-4 text-base italic text-foreground/90">
            <Quote className="h-5 w-5 shrink-0 text-accent" />
            <span>
              "Innovation is only authentic when it is sovereign. Engineering the operating
              system of a new digital civilization from the heart of Real del Monte."
            </span>
          </blockquote>
          <div className="mono mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">
            — Edwin O. Castillo Trejo · {PIDS.VERSION}
          </div>
        </Panel>
      </div>
    </div>
  );
}