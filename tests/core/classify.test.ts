import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyResponse } from '../../src/core/classify.js';

test('201 is a created outcome carrying id, url and dedup=false', () => {
  const outcome = classifyResponse(201, {
    api_description_version_id: '01HX',
    dedup: false,
    url: 'https://app/x',
  });
  assert.deepEqual(outcome, {
    kind: 'created',
    id: '01HX',
    url: 'https://app/x',
    dedup: false,
  });
});

test('200 is a deduplicated outcome with id and dedup=true, no url', () => {
  const outcome = classifyResponse(200, { api_description_version_id: '01HX', dedup: true });
  assert.deepEqual(outcome, { kind: 'deduplicated', id: '01HX', dedup: true });
});

test('401 maps to authFailed', () => {
  assert.deepEqual(classifyResponse(401, { message: 'nope' }), { kind: 'authFailed' });
});

test('404 maps to projectNotFound', () => {
  assert.deepEqual(classifyResponse(404, {}), { kind: 'projectNotFound' });
});

test('413 maps to tooLarge', () => {
  assert.deepEqual(classifyResponse(413, {}), { kind: 'tooLarge' });
});

test('422 carries the contract-owned pointer list', () => {
  const body = { errors: [{ pointer: '/paths', message: 'bad' }] };
  assert.deepEqual(classifyResponse(422, body), {
    kind: 'validation',
    pointers: [{ pointer: '/paths', message: 'bad' }],
  });
});

test('422 with a missing errors array yields an empty pointer list', () => {
  assert.deepEqual(classifyResponse(422, {}), { kind: 'validation', pointers: [] });
});

test('429 maps to rateLimited', () => {
  assert.deepEqual(classifyResponse(429, {}), { kind: 'rateLimited' });
});

test('an unknown status is a transport outcome carrying status and detail', () => {
  const outcome = classifyResponse(500, 'Internal Server Error');
  assert.equal(outcome.kind, 'transport');
  if (outcome.kind === 'transport') {
    assert.equal(outcome.status, 500);
    assert.match(outcome.detail, /Internal Server Error/);
  }
});
