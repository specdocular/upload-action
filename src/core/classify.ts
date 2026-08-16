export interface ValidationPointer {
  pointer: string;
  message: string;
}

export type Outcome =
  | { kind: 'created'; id: string; url: string; dedup: false }
  | { kind: 'deduplicated'; id: string; dedup: true }
  | { kind: 'authFailed' }
  | { kind: 'projectNotFound' }
  | { kind: 'tooLarge' }
  | { kind: 'validation'; pointers: ValidationPointer[] }
  | { kind: 'rateLimited' }
  | { kind: 'transport'; status: number; detail: string };

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
}

/**
 * Translate the platform's HTTP response into a sealed outcome
 * (a Message Translator at the edge, EIP). The response contract is
 * ADR 0094 § "Response contract" as renamed by ADR 0172 §3.
 */
export function classifyResponse(status: number, body: unknown): Outcome {
  const record = asRecord(body);

  switch (status) {
    case 201:
      return {
        kind: 'created',
        id: String(record.api_description_version_id ?? ''),
        url: String(record.url ?? ''),
        dedup: false,
      };
    case 200:
      return {
        kind: 'deduplicated',
        id: String(record.api_description_version_id ?? ''),
        dedup: true,
      };
    case 401:
      return { kind: 'authFailed' };
    case 404:
      return { kind: 'projectNotFound' };
    case 413:
      return { kind: 'tooLarge' };
    case 422: {
      const errors = Array.isArray(record.errors) ? (record.errors as ValidationPointer[]) : [];
      return { kind: 'validation', pointers: errors };
    }
    case 429:
      return { kind: 'rateLimited' };
    default:
      return {
        kind: 'transport',
        status,
        detail: typeof body === 'string' ? body : JSON.stringify(body),
      };
  }
}
