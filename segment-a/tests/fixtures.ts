import { sha256 } from '../src/vendor/scout/compiler';
import type { DiskDefinition } from '../src/vendor/scout/types';

export function definition(id = 'DSK-000001'): DiskDefinition {
  return {
    id, label: 'Systems scope', description: 'Operator test input', observation_type: 'job_posting', version: '1.0.0', status: 'draft',
    territory: { zipCode: '10001', radiusMiles: 25 }, industry: [{ code: '541511', title: 'Software' }], roles: [{ code: '15-1252', title: 'Software developers' }],
    keywords: { logic: 'match_any_role_scope_and_exclude_global', scopes: [{ target_soc: '15-1252', include: ['systems'] }], global_exclude: [], optional_specialty_flags: [] }, execution_profile: 'standard',
  };
}

// Existing RunnerOutput → ObservationArtifact / TravelingEnvelope shape.
// All fixtures are test-only; production never preloads these records.
export async function returned(uid = 'OBS-ONE', raw = 'Python systems experience is required.\r\nLeadership preferred.\n') {
  return {
    runner_id: 'OPERATOR-RUNNER', batch_id: 'OPERATOR-BATCH',
    observations: [{
      canonical: { Observation_ID: uid, Employer: 'Example', Job_Title: 'Engineer', Source_URL: `https://example.com/${uid}` },
      envelope: {
        target_identity: { observation_id: uid, employer: 'Example', job_title: 'Engineer' },
        payload: { scout: {
          section_8_source: { source_text: raw, source_hash: `sha256:${await sha256(raw)}`, is_preserved_source: true },
          path_b_semantic: { fact_table: [{ text: 'Python systems experience is required', qualifier: 'requirement', category: 'Skills', trace: [] }, { text: 'Leadership preferred', qualifier: 'preference', category: 'Leadership', trace: [] }] },
        } },
      },
    }],
  };
}
