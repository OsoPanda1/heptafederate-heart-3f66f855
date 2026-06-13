import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/atlas/metasystem")({
  component: MetasystemPage,
  head: () => ({
    meta: [
      { title: "TAMV Metasystem · Supreme Concentric Map" },
      {
        name: "description",
        content:
          "Arquitectura antropocéntrica inmutable: núcleo humano, Isabella satélite, ID en Vida, 7 federaciones heptafederadas y matriz de fricciones / soluciones.",
      },
    ],
  }),
});

type Layer = "idVida" | "federaciones" | "matriz";

interface Node {
  id: string;
  name: string;
  layer: Layer;
  angle: number;
  size: number;
  color: string;
  value: string;
  type?: "problem" | "solution";
  targetProblem?: string;
  parentFed?: string;
  x?: number;
  y?: number;
}

interface Link {
  from: string;
  to: string;
}

const colors = {
  bg: "#040408",
  human: "#F59E0B",
  isabella: "#00F2FE",
  idVida: "#3B82F6",
  federation: "#F8FAFC",
  problem: "#EF4444",
  solution: "#10B981",
};

const radii = { idVida: 120, federaciones: 230, matriz: 340 } as const;
const isabellaRadius = 55;

function fedAngle(i: number) {
  return (i * (2 * Math.PI)) / 7 - Math.PI / 2;
}

const masterNodes: Node[] = [
  {
    id: "ID_VIDA",
    name: "ID EN VIDA (SOBERANÍA)",
    layer: "idVida",
    angle: Math.PI * 0.5,
    size: 5,
    color: colors.idVida,
    value:
      "Soberanía de identidad biológica y digital. Blindaje absoluto contra el extractivismo de datos y el capitalismo de vigilancia.",
  },
  {
    id: "SYS_4L",
    name: "SISTEMA 4L GOBERNANZA",
    layer: "idVida",
    angle: Math.PI * 1.5,
    size: 5,
    color: colors.idVida,
    value:
      "Modelo normativo de capas lineales que asegura la transparencia y el control humano sobre la plataforma.",
  },
  { id: "FED_1", name: "L0–L2: INFRAESTRUCTURA MESH", layer: "federaciones", angle: fedAngle(0), size: 6, color: colors.federation, value: "Redes de malla físicas fijadas en el territorio, base de resiliencia para todos los servicios." },
  { id: "FED_2", name: "L3–L4: KERNELS MD-X4 & X5", layer: "federaciones", angle: fedAngle(1), size: 6, color: colors.federation, value: "Motores lógicos autopoieticos redundantes para contingencia ante ataques y fallas críticas." },
  { id: "FED_3", name: "L5–L7: OMNIKERNEL DE RED", layer: "federaciones", angle: fedAngle(2), size: 6, color: colors.federation, value: "Sincronización en malla distribuida, asegurando coherencia de estado y continuidad de servicio." },
  { id: "FED_4", name: "M0–M2: GEMET EOCT ÉTICO", layer: "federaciones", angle: fedAngle(3), size: 6, color: colors.federation, value: "Matriz algorítmica de contención que regula el comportamiento de los modelos de inferencia y su alineación ética." },
  { id: "FED_5", name: "M3–M4: CAMPUS ONLINE UTAMV", layer: "federaciones", angle: fedAngle(4), size: 6, color: colors.federation, value: "Estructura modular universitaria para transferencia de alta arquitectura de sistemas y soberanía digital." },
  { id: "FED_6", name: "M5–M6: FORO RDM DIGITAL", layer: "federaciones", angle: fedAngle(5), size: 6, color: colors.federation, value: "Canal comunitario de comunicación y coordinación de soberanía tecnológica territorial." },
  { id: "FED_7", name: "M7: RDM LIVOS NEXTGEN", layer: "federaciones", angle: fedAngle(6), size: 6, color: colors.federation, value: "Plataforma inteligente de desarrollo comercial y turismo, dedicada con honor a Reyna Trejo Serrano." },
  { id: "P_CENSURA", name: "VULNERABILIDAD: CENSURA / APAGÓN CLOUD", layer: "matriz", angle: fedAngle(0) - 0.15, size: 4, color: colors.problem, type: "problem", value: "Bloqueos corporativos perimetrales que intentan aislar la infraestructura local y cortar continuidad de servicios." },
  { id: "S_CENSURA", name: "SOLUCIÓN: 206 REPOSITORIOS SOB_100", layer: "matriz", angle: fedAngle(0) + 0.15, size: 5, color: colors.solution, type: "solution", targetProblem: "P_CENSURA", parentFed: "FED_1", value: "Despliegue P2P distribuido e inmune a suspensiones o bloqueos centralizados de proveedores de nube." },
  { id: "P_DATA", name: "VULNERABILIDAD: MONOPOLIO EXTRACTIVO DE DATOS", layer: "matriz", angle: fedAngle(3) - 0.15, size: 4, color: colors.problem, type: "problem", value: "Modelos predictivos comerciales que mercantilizan el comportamiento de usuarios y comunidades." },
  { id: "S_DATA", name: "SOLUCIÓN: FILTRO DE INFERENCIA SOBERANO", layer: "matriz", angle: fedAngle(3) + 0.15, size: 5, color: colors.solution, type: "solution", targetProblem: "P_DATA", parentFed: "FED_4", value: "Procesamiento local en Nodo Cero, destruyendo rastro de tracking o metadatos externos y controlando inferencias." },
  { id: "P_COMERCIO", name: "VULNERABILIDAD: CAPITALISMO DIGITAL EXTRACTIVO", layer: "matriz", angle: fedAngle(6) - 0.15, size: 4, color: colors.problem, type: "problem", value: "Comisiones abusivas de pasarelas multinacionales que desangran la economía de comercios locales y artesanos." },
  { id: "S_COMERCIO", name: "SOLUCIÓN: IMPULSO RDM LIVOS SIN COMISIÓN", layer: "matriz", angle: fedAngle(6) + 0.15, size: 5, color: colors.solution, type: "solution", targetProblem: "P_COMERCIO", parentFed: "FED_7", value: "Directorio inteligente y pasarela soberana directa para comercios de RDM, sin intermediarios ni comisiones extractivas." },
];

const masterLinks: Link[] = [
  { from: "ID_VIDA", to: "FED_1" },
  { from: "ID_VIDA", to: "FED_4" },
  { from: "SYS_4L", to: "FED_7" },
  { from: "FED_1", to: "FED_2" },
  { from: "FED_2", to: "FED_3" },
  { from: "FED_3", to: "FED_4" },
  { from: "FED_4", to: "FED_5" },
  { from: "FED_5", to: "FED_6" },
  { from: "FED_6", to: "FED_7" },
  { from: "FED_7", to: "FED_1" },
  { from: "FED_1", to: "P_CENSURA" },
  { from: "FED_4", to: "P_DATA" },
  { from: "FED_7", to: "P_COMERCIO" },
];

function MetasystemPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cx = 0;
    let cy = 0;
    let isabellaAngle = -Math.PI / 2;
    let planeActive = false;
    let visibleSolutions: string[] = [];
    let timers: ReturnType<typeof setTimeout>[] = [];
    let hoverNode: (Node & { x?: number; y?: number }) | null = null;
    let rafId = 0;

    function resize() {
      const parent = canvas!.parentElement!;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = rect.width + "px";
      canvas!.style.height = rect.height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = rect.width / 2;
      cy = rect.height / 2;
    }

    function coords(node: Node) {
      const r = radii[node.layer];
      return { x: cx + r * Math.cos(node.angle), y: cy + r * Math.sin(node.angle) };
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      ctx!.save();
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = "rgba(59,130,246,0.12)";
      ctx!.beginPath(); ctx!.arc(cx, cy, radii.idVida, 0, Math.PI * 2); ctx!.stroke();
      ctx!.strokeStyle = "rgba(255,255,255,0.04)";
      ctx!.beginPath(); ctx!.arc(cx, cy, radii.federaciones, 0, Math.PI * 2); ctx!.stroke();
      ctx!.strokeStyle = "rgba(255,255,255,0.02)";
      ctx!.beginPath(); ctx!.arc(cx, cy, radii.matriz, 0, Math.PI * 2); ctx!.stroke();
      ctx!.restore();

      isabellaAngle += 0.003;
      const isaX = cx + isabellaRadius * Math.cos(isabellaAngle);
      const isaY = cy + isabellaRadius * Math.sin(isabellaAngle);

      ctx!.save();
      ctx!.strokeStyle = "rgba(0,242,254,0.2)";
      ctx!.lineWidth = 1.5;
      ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(isaX, isaY); ctx!.stroke();
      ctx!.strokeStyle = "rgba(0,242,254,0.04)";
      ctx!.lineWidth = 0.8;
      ctx!.beginPath(); ctx!.arc(cx, cy, isabellaRadius, 0, Math.PI * 2); ctx!.stroke();
      ctx!.restore();

      ctx!.save();
      ctx!.lineWidth = 1.2;
      ctx!.strokeStyle = "rgba(255,255,255,0.06)";
      masterLinks.forEach((link) => {
        const a = masterNodes.find((n) => n.id === link.from);
        const b = masterNodes.find((n) => n.id === link.to);
        if (!a || !b) return;
        const ca = coords(a);
        const cb = coords(b);
        ctx!.beginPath();
        ctx!.moveTo(ca.x, ca.y);
        ctx!.quadraticCurveTo(cx, cy, cb.x, cb.y);
        ctx!.stroke();
      });
      ctx!.restore();

      if (planeActive) {
        masterNodes
          .filter((n) => n.type === "solution" && visibleSolutions.includes(n.id))
          .forEach((sol) => {
            const cSol = coords(sol);
            const fed = masterNodes.find((n) => n.id === sol.parentFed);
            const prob = masterNodes.find((n) => n.id === sol.targetProblem);
            if (fed) {
              const cFed = coords(fed);
              ctx!.save();
              ctx!.strokeStyle = "rgba(16,185,129,0.15)";
              ctx!.beginPath();
              ctx!.moveTo(cFed.x, cFed.y);
              ctx!.quadraticCurveTo(cx, cy, cSol.x, cSol.y);
              ctx!.stroke();
              ctx!.restore();
            }
            if (prob) {
              const cProb = coords(prob);
              ctx!.save();
              ctx!.strokeStyle = colors.solution;
              ctx!.setLineDash([2, 4]);
              ctx!.beginPath();
              ctx!.moveTo(cSol.x, cSol.y);
              ctx!.lineTo(cProb.x, cProb.y);
              ctx!.stroke();
              ctx!.setLineDash([]);
              ctx!.restore();
            }
          });
      }

      masterNodes.forEach((node) => {
        if (node.type === "solution" && (!planeActive || !visibleSolutions.includes(node.id))) return;
        const { x, y } = coords(node);
        node.x = x;
        node.y = y;
        const hovered = hoverNode && hoverNode.id === node.id;
        ctx!.save();
        ctx!.fillStyle = node.color;
        ctx!.beginPath();
        ctx!.arc(x, y, hovered ? node.size + 3 : node.size, 0, Math.PI * 2);
        ctx!.fill();
        if (node.layer === "federaciones") {
          ctx!.strokeStyle = "rgba(255,255,255,0.15)";
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.arc(x, y, node.size + 4, 0, Math.PI * 2);
          ctx!.stroke();
        }
        if (node.layer !== "matriz" || hovered) {
          ctx!.fillStyle = hovered ? "#FFFFFF" : "#94A3B8";
          ctx!.font = hovered ? "bold 9px monospace" : "9px monospace";
          const sideRight = node.angle > 0 && node.angle < Math.PI;
          ctx!.textAlign = sideRight ? "left" : "right";
          ctx!.fillText(node.name, x + (sideRight ? 12 : -12), y + 3);
        }
        ctx!.restore();
      });

      ctx!.save();
      const humanHovered = hoverNode && hoverNode.id === "HUMAN";
      ctx!.fillStyle = colors.human;
      ctx!.beginPath();
      ctx!.arc(cx, cy, humanHovered ? 18 : 14, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "#FFFFFF";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, humanHovered ? 22 : 18, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.fillStyle = "#FFFFFF";
      ctx!.font = "bold 9px monospace";
      ctx!.textAlign = "center";
      ctx!.fillText("HUMANO", cx, cy + 3);
      ctx!.restore();

      ctx!.save();
      const isaHovered = hoverNode && hoverNode.id === "ISABELLA";
      ctx!.fillStyle = colors.isabella;
      ctx!.beginPath();
      ctx!.arc(isaX, isaY, isaHovered ? 8 : 6, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "#00F2FE";
      ctx!.font = "8px monospace";
      ctx!.textAlign = "center";
      ctx!.fillText("ISABELLA AI", isaX, isaY - 10);
      ctx!.restore();

      if (hoverNode) {
        const w = 260;
        const tx = cx - w / 2;
        let ty = cy + radii.idVida - 35;
        if (hoverNode.y !== undefined && hoverNode.y > cy) ty = cy - radii.idVida - 100;
        ctx!.save();
        ctx!.fillStyle = "rgba(5,5,12,0.96)";
        ctx!.strokeStyle = "rgba(255,255,255,0.08)";
        ctx!.lineWidth = 1;
        ctx!.fillRect(tx, ty, w, 85);
        ctx!.strokeRect(tx, ty, w, 85);
        ctx!.fillStyle = hoverNode.color || colors.federation;
        ctx!.fillRect(tx, ty, w, 2);
        ctx!.fillStyle = "#FFFFFF";
        ctx!.font = "bold 9px monospace";
        ctx!.textAlign = "left";
        ctx!.fillText(hoverNode.name.substring(0, 38), tx + 12, ty + 16);
        ctx!.fillStyle = "#94A3B8";
        ctx!.font = "10px system-ui, sans-serif";
        const words = (hoverNode.value || "").split(" ");
        let line = "";
        let yOffset = ty + 32;
        const max = 42;
        words.forEach((wd, i) => {
          const test = line + wd + " ";
          if (test.length > max && i > 0) {
            ctx!.fillText(line, tx + 12, yOffset);
            line = wd + " ";
            yOffset += 13;
          } else {
            line = test;
          }
        });
        if (line) ctx!.fillText(line, tx + 12, yOffset);
        ctx!.restore();
      }

      rafId = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (Math.hypot(mx - cx, my - cy) < 18) {
        hoverNode = {
          id: "HUMAN",
          name: "NÚCLEO: SER HUMANO",
          value:
            "Origen y fin último de la arquitectura del TAMV. Todos los datos permanecen bajo control biológico consciente.",
          color: colors.human,
          layer: "idVida",
          angle: 0,
          size: 14,
        };
        return;
      }
      const isaX = cx + isabellaRadius * Math.cos(isabellaAngle);
      const isaY = cy + isabellaRadius * Math.sin(isabellaAngle);
      if (Math.hypot(mx - isaX, my - isaY) < 10) {
        hoverNode = {
          id: "ISABELLA",
          name: "SATÉLITE: ISABELLA ENGINE AI",
          value:
            "Puente cognitivo institucional. Mediador y escudo de inferencia para asegurar que la tecnología sirva estrictamente al ser humano.",
          color: colors.isabella,
          layer: "idVida",
          angle: 0,
          size: 6,
        };
        return;
      }
      let found: Node | null = null;
      masterNodes.forEach((n) => {
        if (n.type === "solution" && (!planeActive || !visibleSolutions.includes(n.id))) return;
        if (n.x === undefined || n.y === undefined) return;
        if (Math.hypot(mx - n.x, my - n.y) < n.size + 8) found = n;
      });
      hoverNode = found;
    }

    function togglePlane(checked: boolean) {
      timers.forEach(clearTimeout);
      timers = [];
      visibleSolutions = [];
      const log = logRef.current;
      const status = statusRef.current;
      const sub = subRef.current;
      if (checked) {
        planeActive = true;
        if (status) { status.innerText = "Desplegando plano de soluciones..."; status.style.color = colors.solution; }
        if (sub) sub.innerText = "Sincronización asíncrona de acciones éticas";
        if (log) log.classList.remove("hidden");
        const sols = masterNodes.filter((n) => n.type === "solution");
        sols.forEach((sol, i) => {
          const t = setTimeout(() => {
            visibleSolutions.push(sol.id);
            if (log) log.innerText = `CONECTADO: ${sol.name}`;
            if (i === sols.length - 1) {
              if (log) log.classList.add("hidden");
              if (status) status.innerText = "Ecosistema sincronizado completo";
            }
          }, (i + 1) * 3500);
          timers.push(t);
        });
      } else {
        planeActive = false;
        if (status) { status.innerText = "Plano de fricciones críticas"; status.style.color = colors.problem; }
        if (sub) sub.innerText = "Auditoría de fallas colaterales";
        if (log) log.classList.add("hidden");
      }
    }

    const onToggle = (e: Event) => togglePlane((e.target as HTMLInputElement).checked);

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    toggleRef.current?.addEventListener("change", onToggle);
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      toggleRef.current?.removeEventListener("change", onToggle);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className="flex h-[calc(100vh-3rem)] w-full select-none flex-col justify-between p-8"
      style={{ backgroundColor: "#030306", color: "#F3F4F6", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <header className="z-10 flex items-start justify-between border-b border-zinc-900/60 pb-5">
        <div>
          <h1 className="text-xl font-light uppercase tracking-[0.35em] text-white">
            TAMV STRATEGIC TRANSFORMATION METASYSTEM
          </h1>
          <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            Arquitectura Antropocéntrica Inmutable · Capas L0–L7 · M0–M7 · GEMET EOCT
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-sm border border-zinc-900 bg-zinc-950/80 px-5 py-3 backdrop-blur-md">
          <div className="text-right">
            <div ref={statusRef} className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Plano de Fricciones Críticas
            </div>
            <div ref={subRef} className="mt-0.5 font-mono text-[8px] text-zinc-600">
              Auditoría de fallas colaterales
            </div>
          </div>
          <label className="relative inline-block h-7 w-14">
            <input ref={toggleRef} type="checkbox" className="peer h-0 w-0 opacity-0" />
            <span className="absolute inset-0 cursor-pointer rounded-full border border-white/10 bg-[#0F1115] transition before:absolute before:bottom-1 before:left-1 before:h-[18px] before:w-[18px] before:rounded-full before:bg-slate-500 before:transition before:content-[''] peer-checked:border-[#00F2FE] peer-checked:bg-[#00F2FE]/10 peer-checked:before:translate-x-7 peer-checked:before:bg-[#00F2FE] peer-checked:before:shadow-[0_0_12px_#00F2FE]" />
          </label>
        </div>
      </header>

      <main className="relative my-4 w-full flex-1 rounded-sm border border-zinc-900/40 bg-[#040408] shadow-[inset_0_0_100px_rgba(0,0,0,0.95)]">
        <canvas ref={canvasRef} className="block h-full w-full" />
        <div
          ref={logRef}
          className="absolute right-6 top-6 hidden rounded-sm border border-zinc-900 bg-black/90 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-cyan-400 transition-all duration-300"
        >
          Sincronizando módulos de mitigación...
        </div>
        <div className="pointer-events-none absolute bottom-6 left-6 max-w-xs space-y-2 rounded-sm border border-zinc-900/80 bg-zinc-950/90 p-5 font-mono text-[9px]">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 text-[11px] font-bold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Topología Concéntrica Rígida
          </div>
          <div className="space-y-1 font-sans text-[10px] text-zinc-400">
            <div>• <span className="font-mono text-[9px] font-bold text-amber-400">NÚCLEO:</span> Conciencia e Integridad Humana.</div>
            <div>• <span className="font-mono text-[9px] font-bold text-cyan-400">SATÉLITE:</span> Isabella AI (Puente Cognitivo).</div>
            <div>• <span className="font-mono text-[9px] font-bold text-blue-400">CAPA 1:</span> ID en Vida (Soberanía y No Extractivismo).</div>
            <div>• <span className="font-mono text-[9px] font-bold text-zinc-300">CAPA 2:</span> Capas L0–L7 & M0–M7 Heptafederadas.</div>
            <div>• <span className="font-mono text-[9px] font-bold text-zinc-500">PERÍMETRO:</span> Matriz de Impacto Acción/Reacción.</div>
          </div>
        </div>
      </main>

      <footer className="z-10 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        <div>Master Systems Architecture · Pure Canvas Engineering</div>
        <div>Nodo Cero · Real del Monte, Hidalgo</div>
      </footer>
    </div>
  );
}
