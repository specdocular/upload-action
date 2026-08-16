/** The fixed canonical key for the single entry document. */
export const ENTRY_KEY = 'openapi.json';

export interface EnvelopeMeta {
  commit: string;
  branch?: string;
  generatorName?: string;
  generatorVersion?: string;
}

export interface Envelope {
  payload_version: 1;
  commit: string;
  documents: Record<string, unknown>;
  entry: string;
  branch?: string;
  generator?: { name: string; version: string };
}

/**
 * Assemble the ADR 0094 push envelope for a single OpenAPI document.
 *
 * The document is keyed by the fixed canonical name, never the source
 * filename: the dedup identity must not encode the producer's local layout
 * (ADR 0139 §4b, Merkle over path-sorted closure).
 */
export function buildEnvelope(specJson: unknown, meta: EnvelopeMeta): Envelope {
  const envelope: Envelope = {
    payload_version: 1,
    commit: meta.commit,
    documents: { [ENTRY_KEY]: specJson },
    entry: ENTRY_KEY,
  };

  if (meta.branch !== undefined) {
    envelope.branch = meta.branch;
  }

  if (meta.generatorName !== undefined && meta.generatorVersion !== undefined) {
    envelope.generator = { name: meta.generatorName, version: meta.generatorVersion };
  }

  return envelope;
}
