// ═══════════════════════════════════════════════════════════════
// Scout A2-A3 Batch Ingress Adapter
// ═══════════════════════════════════════════════════════════════

import type { BatchDiskResult } from './batch-compiler';

export const SCOUT_MAX_JOB_PROCESSING_LIMIT = 50;

export interface RunnerIngressPackage {
  runner_id: string;
  runner_protocol: string;
  status: 'READY' | 'FAILED_VALIDATION';
  cartridge_id: string;
  content_hash: string;
  compiled_cartridge: BatchDiskResult['compiled_cartridge'];
  ingress_constraints: {
    pipeline_target: 'A2~A3_SCOUT_COLLECTION_GATES';
    system_max_limit: number;
    runner_job_limit: number;
    pre_gate_enforcement: 'TRUNCATE_OR_REJECT_AT_50';
    output_contract_fields: string[];
    deduplication_mode: string;
    normalization_mode: string;
  };
  validation_summary: {
    passed: boolean;
    checks_passed: number;
    total_checks: number;
    errors?: string[];
  };
}

export interface ScoutA2A3BatchIngressEnvelope {
  $schema: string;
  batch_id: string;
  schema_version: '2.2.0';
  generated_at: string;
  system_limits: {
    scout_max_job_processing_limit: number;
    enforcement_rule: 'Candidate pool must be clamped to <= 50 before Envoy 1 Gate 1';
  };
  total_runners: number;
  certified_runners: number;
  failed_runners: number;
  runner_ingress_packages: RunnerIngressPackage[];
}

export function toScoutIngressEnvelope(
  batchId: string,
  results: readonly BatchDiskResult[]
): ScoutA2A3BatchIngressEnvelope {
  const packages: RunnerIngressPackage[] = results.map((result) => {
    const cart = result.compiled_cartridge;
    const isCertified = result.validation.passed === true;
    const failingChecks = result.validation.checks
      .filter((check) => !check.passed)
      .map((check) => `Check ${check.id} (${check.name}): ${check.detail}`);

    const requestedLimit = cart.machine_payload.exec.limit;
    const runnerJobLimit = Math.min(requestedLimit, SCOUT_MAX_JOB_PROCESSING_LIMIT);

    return {
      runner_id: result.runner_id,
      runner_protocol: `DIPLOMAT / SCOUT Protocol ${result.runner_id}`,
      status: isCertified ? 'READY' : 'FAILED_VALIDATION',
      cartridge_id: cart.metadata.cartridge_id,
      content_hash: cart.certification.content_hash,
      compiled_cartridge: cart,
      ingress_constraints: {
        pipeline_target: 'A2~A3_SCOUT_COLLECTION_GATES',
        system_max_limit: SCOUT_MAX_JOB_PROCESSING_LIMIT,
        runner_job_limit: runnerJobLimit,
        pre_gate_enforcement: 'TRUNCATE_OR_REJECT_AT_50',
        output_contract_fields: cart.machine_payload.contract.output_fields,
        deduplication_mode: cart.machine_payload.contract.deduplication,
        normalization_mode: cart.machine_payload.contract.normalization,
      },
      validation_summary: {
        passed: isCertified,
        checks_passed: result.validation.checks.filter((check) => check.passed).length,
        total_checks: result.validation.checks.length,
        ...(isCertified ? {} : { errors: failingChecks }),
      },
    };
  });

  return {
    $schema: 'https://digital-alchemy.net/schemas/scout/a2-a3-batch-ingress.schema.json',
    batch_id: batchId,
    schema_version: '2.2.0',
    generated_at: new Date().toISOString(),
    system_limits: {
      scout_max_job_processing_limit: SCOUT_MAX_JOB_PROCESSING_LIMIT,
      enforcement_rule: 'Candidate pool must be clamped to <= 50 before Envoy 1 Gate 1',
    },
    total_runners: packages.length,
    certified_runners: packages.filter((pkg) => pkg.status === 'READY').length,
    failed_runners: packages.filter((pkg) => pkg.status === 'FAILED_VALIDATION').length,
    runner_ingress_packages: packages,
  };
}
