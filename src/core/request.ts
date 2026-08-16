/** The platform ingest endpoint for a project's spec pushes. */
export function buildEndpoint(platformUrl: string, slug: string): string {
  const origin = platformUrl.replace(/\/+$/, '');
  return `${origin}/api/v1/projects/${encodeURIComponent(slug)}/builds`;
}

/**
 * Resolve the branch name from the explicit input, then the PR head ref, then
 * the ref name. Empty strings are treated as absent: push events set
 * GITHUB_HEAD_REF to "", which must fall through to GITHUB_REF_NAME.
 */
export function resolveBranch(
  inputBranch: string | undefined,
  headRef: string | undefined,
  refName: string | undefined,
): string | undefined {
  return inputBranch || headRef || refName || undefined;
}
