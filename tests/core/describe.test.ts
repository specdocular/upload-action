import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeFailure } from '../../src/core/describe.js';
import type { Outcome } from '../../src/core/classify.js';

test('success outcomes have no failure message', () => {
  assert.equal(describeFailure({ kind: 'created', id: 'x', url: 'u', dedup: false }), null);
  assert.equal(describeFailure({ kind: 'deduplicated', id: 'x', dedup: true }), null);
});

test('auth failure names the token secret', () => {
  const msg = describeFailure({ kind: 'authFailed' });
  assert.match(String(msg), /token/i);
});

test('project-not-found names both slug and token-project mismatch causes', () => {
  const msg = String(describeFailure({ kind: 'projectNotFound' }));
  assert.match(msg, /project-slug/);
  assert.match(msg, /token/i);
});

test('too-large names the payload cap', () => {
  assert.match(String(describeFailure({ kind: 'tooLarge' })), /cap|large|size/i);
});

test('rate-limited says re-run later', () => {
  assert.match(String(describeFailure({ kind: 'rateLimited' })), /rate|re-?run|later/i);
});

test('transport carries the status and detail', () => {
  const msg = String(describeFailure({ kind: 'transport', status: 503, detail: 'unavailable' }));
  assert.match(msg, /503/);
  assert.match(msg, /unavailable/);
});

test('validation summarises the count', () => {
  const outcome: Outcome = {
    kind: 'validation',
    pointers: [
      { pointer: '/a', message: 'x' },
      { pointer: '/b', message: 'y' },
    ],
  };
  assert.match(String(describeFailure(outcome)), /2/);
});
