import { decomposeDescription, type DecompResult } from './decomposition-engine';
import { sha256 } from './compiler';
import type {
  CandidateJob,
  CanonicalRow,
  Cartridge,
  EnvelopeFact,
  TravelingEnvelope,
} from './types';

export interface ObservationArtifact {
  canonical: CanonicalRow;
  envelope: TravelingEnvelope;
  decomp: DecompResult;
}

/**
 * Construct the authoritative single-run output artifacts for one accepted
 * observation. This is the existing PipelineSimulator behavior extracted into
 * a reusable function; it does not change collection or decomposition semantics.
 */
export async function buildObservationArtifact(
  cartridge: Cartridge,
  candidate: CandidateJob,
  dedupKey: string,
  duplicateCount: number,
): Promise<ObservationArtifact> {
  const observationId = `OBS-${dedupKey.substring(0, 12).toUpperCase()}`;
  const naicsEntry = cartridge.definition.industry
    .find((industry) => industry.code === candidate.naics_code);
  const canonical: CanonicalRow = {
    Observation_ID: observationId,
    Collection_Date: new Date().toISOString().split('T')[0],
    Vendor: candidate.vendor,
    Employer: candidate.employer,
    Job_Title: candidate.title,
    City: candidate.city,
    State: candidate.state,
    ZIP: candidate.zip,
    Industry: naicsEntry
      ? `${naicsEntry.code} — ${naicsEntry.title}`
      : candidate.naics_code,
    Employment_Type: candidate.employment_type,
    Compensation: candidate.compensation,
    Source_URL: candidate.source_url,
    Duplicate_Count: duplicateCount,
  };

  const decomp = decomposeDescription(candidate.description);
  const sourceHash = await sha256(candidate.description);
  const now = new Date().toISOString();
  const factTable: EnvelopeFact[] = decomp.facts.map((fact) => ({
    text: fact.text,
    category: fact.category,
    qualifier: fact.qualifier,
    trace: fact.rule_trace,
  }));

  const envelope: TravelingEnvelope = {
    $schema: 'https://json-schema.spatial-dna.org/v0.2/envelope.json',
    envelope_id: `ENV-${observationId}`,
    created_at: now,
    target_identity: {
      observation_id: observationId,
      employer: candidate.employer,
      job_title: candidate.title,
      deduplication_key: dedupKey,
    },
    stage_state: {
      current_stage: 'b',
      completed_stages: ['scout'],
      status: 'ready',
    },
    append_history: [{
      stage: 'scout',
      operation: 'initialize_and_append',
      timestamp: now,
    }],
    payload: {
      scout: {
        path_a_structured: canonical,
        path_b_semantic: {
          categories: decomp.categories,
          fact_table: factTable,
          rule_log: decomp.rule_log,
          total_facts: decomp.total_facts,
        },
        section_8_source: {
          source_text: candidate.description,
          source_hash: `sha256:${sourceHash}`,
          capture_timestamp: now,
          is_preserved_source: true,
        },
      },
      b: null,
      b1: null,
      b2: null,
      b3: null,
      b4: null,
      b5: null,
    },
  };

  return { canonical, envelope, decomp };
}
