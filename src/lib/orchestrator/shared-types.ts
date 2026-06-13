/**
 * Contratos base del orquestador TAMV.
 *
 * Versión endurecida de los tipos compartidos entre kernels (MD-X4 / MD-X5),
 * Isabella, la economía interna y la malla MSR. Mantener mínimo y estable:
 * cualquier campo añadido aquí debe poder leerse desde todos los runtimes
 * (frontend SSR, backend NextGen Node, edge functions Deno).
 */

/** Estado del subsistema de IA reportado por el gateway de Isabella. */
export interface AIStatus {
  /** p.ej. 'idle' | 'training' | 'degraded' | 'offline' */
  state: string;
  /** Mensaje opcional para diagnóstico humano. */
  message?: string;
  /** ISO 8601. */
  updatedAt?: string;
}

/** Saldo de la economía interna (TCEP / TAMV / créditos territoriales). */
export interface EconomyBalance {
  balance: number;
  /** Unidad semántica, p.ej. 'TAMV' | 'MSR' | 'USD'. */
  unit?: string;
  updatedAt?: string;
}

/**
 * Altura actual de la cadena: número de bloques desde el bloque génesis (0).
 * Alineado con la semántica estándar de block height en blockchains.
 */
export interface BlockchainHeight {
  height: number;
  /** p.ej. 'msr-mainnet' | 'msr-testnet'. */
  network?: string;
  updatedAt?: string;
}

/** Snapshot agregado consumible por dashboards (MD-X4 / MD-X5). */
export interface OrchestratorSnapshot {
  ai: AIStatus;
  economy: EconomyBalance;
  chain: BlockchainHeight;
  capturedAt: string;
}
