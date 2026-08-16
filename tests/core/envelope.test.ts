import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEnvelope } from '../../src/core/envelope.js';

test('keys the single document by the fixed canonical name regardless of source filename', () => {
  const spec = { openapi: '3.1.0', info: { title: 'x', version: '1' }, paths: {} };
  const envelope = buildEnvelope(spec, { commit: 'a'.repeat(40) });

  assert.equal(envelope.payload_version, 1);
  assert.equal(envelope.commit, 'a'.repeat(40));
  assert.deepEqual(Object.keys(envelope.documents), ['openapi.json']);
  assert.deepEqual(envelope.documents['openapi.json'], spec);
  assert.equal(envelope.entry, 'openapi.json');
});

test('omits branch when not provided and includes it when provided', () => {
  const spec = { openapi: '3.1.0' };
  assert.ok(!('branch' in buildEnvelope(spec, { commit: 'b'.repeat(40) })));
  assert.equal(
    buildEnvelope(spec, { commit: 'b'.repeat(40), branch: 'feature/x' }).branch,
    'feature/x',
  );
});

test('includes generator only when both name and version are present', () => {
  const spec = { openapi: '3.1.0' };
  const commit = 'c'.repeat(40);

  assert.ok(!('generator' in buildEnvelope(spec, { commit })));
  assert.ok(!('generator' in buildEnvelope(spec, { commit, generatorName: 'laragen' })));
  assert.ok(!('generator' in buildEnvelope(spec, { commit, generatorVersion: '1.0.0' })));

  const withGen = buildEnvelope(spec, {
    commit,
    generatorName: 'laragen',
    generatorVersion: '1.0.0',
  });
  assert.deepEqual(withGen.generator, { name: 'laragen', version: '1.0.0' });
});
