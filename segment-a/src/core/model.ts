// Session-only structural types. No new permanent runner or wire schema.
import type { Cartridge, ValidationResult } from '../vendor/scout/types';
export type Decision = 'PENDING' | 'PUSH' | 'PIN' | 'REJECT';
export interface ScopeRun { invocation: string; cartridge: Cartridge; validation: ValidationResult }
export interface Job {
  key: string; uid: string | null; employer: string; title: string; sourceUrl: string;
  raw: string; display: string; sourceHash: string; sourceRefs: string[];
  batchId: string | null; runnerId: string | null; scopeInvocation: string | null;
  archivedScope: ScopeRun | null;
  decision: Decision; duplicateOf: string | null;
  taxonomy: { hard_requirements: string[]; soft_requirements: string[]; keyword_lexicon: string[] } | null;
}
export interface Refusal { stage: string; resource: string; reason: string }
export interface Pair {
  uid: string; runId: string; envelope: string; sidecar: string;
  envelopeHash: string; sidecarHash: string;
}
export interface Committed {
  id: string; pairs: Pair[]; corpus: Job[];
  payloads: { ref: string; raw: string }[];
  scopes: ScopeRun[];
  state: 'COMMITTED' | 'LOCALLY_VERIFIED' | 'AWAITING_ACK' | 'ACCEPTED' | 'BLOCKED';
  failures: Refusal[];
}
export interface HandoffReceipt {
  // Provisional adapter seam; no deployed receiver contract has been established.
  transactionId: string; receiver: string;
  artifacts: { uid: string; envelopeHash: string; sidecarHash: string; accepted: boolean; reason?: string }[];
}
export interface Receiver {
  receive(transactionId: string, pairs: readonly Pair[]): Promise<HandoffReceipt>;
}
export function required(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is missing; A will not invent it.`);
}
