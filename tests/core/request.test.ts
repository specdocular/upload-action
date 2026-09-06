import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEndpoint, resolveBranch } from '../../src/core/request.js';

test('buildEndpoint templates the ingest path and strips trailing slashes', () => {
  assert.equal(
    buildEndpoint('https://specdocular.com', 'my-project'),
    'https://specdocular.com/api/v1/projects/my-project/versions',
  );
  assert.equal(
    buildEndpoint('https://specdocular.com/', 'my-project'),
    'https://specdocular.com/api/v1/projects/my-project/versions',
  );
  assert.equal(
    buildEndpoint('https://specdocular.com///', 'my-project'),
    'https://specdocular.com/api/v1/projects/my-project/versions',
  );
});

test('buildEndpoint url-encodes the slug', () => {
  assert.equal(
    buildEndpoint('https://specdocular.com', 'a b/c'),
    'https://specdocular.com/api/v1/projects/a%20b%2Fc/versions',
  );
});

test('resolveBranch prefers the explicit input', () => {
  assert.equal(resolveBranch('feature/x', 'head', 'ref'), 'feature/x');
});

test('resolveBranch falls back to the PR head ref, then the ref name', () => {
  assert.equal(resolveBranch(undefined, 'pr-head', 'main'), 'pr-head');
  assert.equal(resolveBranch(undefined, undefined, 'main'), 'main');
});

test('resolveBranch treats an empty head ref as absent (push events set it to "")', () => {
  assert.equal(resolveBranch(undefined, '', 'main'), 'main');
});

test('resolveBranch is undefined when nothing resolves', () => {
  assert.equal(resolveBranch(undefined, undefined, undefined), undefined);
  assert.equal(resolveBranch(undefined, '', ''), undefined);
});
