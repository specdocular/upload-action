import type { ValidationPointer } from './classify.js';

/**
 * Render the contract's 422 pointer list to per-error display messages. A
 * pointer of '' addresses the whole document, so its message stands alone.
 * The caller emits each line through `@actions/core.error`, which owns the
 * `::error::` workflow-command framing and its escaping.
 */
export function formatAnnotations(pointers: ValidationPointer[]): string[] {
  return pointers.map(({ pointer, message }) =>
    pointer === '' ? message : `${pointer}: ${message}`,
  );
}
