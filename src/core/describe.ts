import type { Outcome } from './classify.js';

/**
 * The actionable failure message for a non-success outcome, or null when the
 * outcome succeeded. One explicit message per status, no auto-retry
 * (ADR 0159 §5 failure UX table, carried forward).
 */
export function describeFailure(outcome: Outcome): string | null {
  switch (outcome.kind) {
    case 'created':
    case 'deduplicated':
      return null;
    case 'authFailed':
      return 'Authentication failed. Check that the `token` secret is set, and that it is not revoked or expired.';
    case 'projectNotFound':
      return 'Project not found. Check `project-slug`, and that the token belongs to this project.';
    case 'tooLarge':
      return 'The spec exceeds the platform payload size cap.';
    case 'rateLimited':
      return 'Rate limited. Re-run this job later.';
    case 'validation':
      return `The platform rejected the spec: ${outcome.pointers.length} validation error(s).`;
    case 'transport':
      return `Upload failed (HTTP ${outcome.status}): ${outcome.detail}`;
  }
}
