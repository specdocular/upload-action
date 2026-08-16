import { readFile } from 'node:fs/promises';
import * as core from '@actions/core';
import { buildEnvelope } from './core/envelope.js';
import { classifyResponse } from './core/classify.js';
import { formatAnnotations } from './core/annotations.js';
import { describeFailure } from './core/describe.js';
import { buildEndpoint, resolveBranch } from './core/request.js';

const DEFAULT_PLATFORM_URL = 'https://specdocular.com';

function optional(name: string): string | undefined {
  const value = core.getInput(name);
  return value === '' ? undefined : value;
}

export async function run(): Promise<void> {
  const file = core.getInput('file', { required: true });
  const slug = core.getInput('project-slug', { required: true });
  const token = core.getInput('token', { required: true });
  const platformUrl = optional('platform-url') ?? DEFAULT_PLATFORM_URL;
  const commit = optional('commit') ?? process.env.GITHUB_SHA ?? '';
  const branch = resolveBranch(
    optional('branch'),
    process.env.GITHUB_HEAD_REF,
    process.env.GITHUB_REF_NAME,
  );

  const specJson = JSON.parse(await readFile(file, 'utf8')) as unknown;
  const envelope = buildEnvelope(specJson, {
    commit,
    branch,
    generatorName: optional('generator-name'),
    generatorVersion: optional('generator-version'),
  });

  const response = await fetch(buildEndpoint(platformUrl, slug), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(envelope),
  });

  const raw = await response.text();
  let body: unknown = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Non-JSON body: classifyResponse falls through to a transport outcome.
  }

  const outcome = classifyResponse(response.status, body);

  switch (outcome.kind) {
    case 'created':
      core.setOutput('api-description-version-id', outcome.id);
      core.setOutput('api-description-version-url', outcome.url);
      core.setOutput('dedup', 'false');
      core.info(`Uploaded. API description version ${outcome.id}: ${outcome.url}`);
      return;
    case 'deduplicated':
      core.setOutput('api-description-version-id', outcome.id);
      core.setOutput('api-description-version-url', '');
      core.setOutput('dedup', 'true');
      core.info(`Identical spec already delivered. API description version ${outcome.id}.`);
      return;
    case 'validation':
      for (const line of formatAnnotations(outcome.pointers)) {
        core.error(line);
      }
      core.setFailed(describeFailure(outcome) ?? 'Validation failed.');
      return;
    default:
      core.setFailed(describeFailure(outcome) ?? 'Upload failed.');
      return;
  }
}
