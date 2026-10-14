import { compileDisk, validateCartridge } from './compiler';
import type { Cartridge, DiskDefinition, ValidationResult } from './types';
import type { ObservationArtifact } from './observation-artifacts';

export interface BatchDiskRequest {
  runner_id: string;
  definition: DiskDefinition;
}

export interface BatchDiskResult {
  runner_id: string;
  disk_id: string;
  compiled_cartridge: Cartridge;
  validation: ValidationResult;
}

export interface RunnerOutput {
  runner_id: string;
  observations: readonly ObservationArtifact[];
}

export interface BatchDiskRuntimeResult extends BatchDiskResult {
  outputs: ObservationArtifact[];
}

/**
 * Compile and validate each definition through the authoritative single-disk path.
 */
export async function compileDiskBatch(
  requests: readonly BatchDiskRequest[],
): Promise<BatchDiskResult[]> {
  const runnerIds = requests.map((request) => request.runner_id);
  if (new Set(runnerIds).size !== runnerIds.length) {
    throw new Error('Each batch member must target a unique runner_id.');
  }
  const diskIds = requests.map((request) => request.definition.id);
  if (new Set(diskIds).size !== diskIds.length) {
    throw new Error('Each batch member must contain a unique disk definition id.');
  }

  return Promise.all(requests.map(async ({ runner_id, definition }) => {
    const compiled_cartridge = compileDisk(definition);
    const validation = await validateCartridge(compiled_cartridge);

    return {
      runner_id,
      disk_id: definition.id,
      compiled_cartridge,
      validation,
    };
  }));
}

/**
 * Preserve the connection between compiled disks and the observation artifacts
 * returned by their runners. The compiler does not process the observations;
 * it only keeps each runner's existing single-run outputs independently
 * addressable alongside the disk that controls that runner.
 */
export function bindRunnerOutputs(
  compiled: readonly BatchDiskResult[],
  returned: readonly RunnerOutput[],
): BatchDiskRuntimeResult[] {
  const outputsByRunner = new Map<string, readonly ObservationArtifact[]>();
  for (const output of returned) {
    if (outputsByRunner.has(output.runner_id)) {
      throw new Error(`Duplicate runner output for ${output.runner_id}.`);
    }
    outputsByRunner.set(output.runner_id, output.observations);
  }

  const compiledRunnerIds = new Set(compiled.map((result) => result.runner_id));
  for (const runnerId of outputsByRunner.keys()) {
    if (!compiledRunnerIds.has(runnerId)) {
      throw new Error(`Runner output has no compiled disk: ${runnerId}.`);
    }
  }

  return compiled.map((result) => {
    const observations = outputsByRunner.get(result.runner_id);
    if (!observations) {
      throw new Error(`Missing runner output for ${result.runner_id}.`);
    }

    return {
      ...result,
      outputs: observations.map((observation) => structuredClone(observation)),
    };
  });
}
