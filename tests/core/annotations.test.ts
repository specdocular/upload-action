import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAnnotations } from '../../src/core/annotations.js';

test('renders one message per pointer, prefixed with the pointer', () => {
  const lines = formatAnnotations([
    { pointer: '/paths/~1users', message: 'missing operationId' },
    { pointer: '/info/version', message: 'required' },
  ]);
  assert.deepEqual(lines, [
    '/paths/~1users: missing operationId',
    '/info/version: required',
  ]);
});

test('a whole-document pointer (empty string) renders the message alone', () => {
  assert.deepEqual(formatAnnotations([{ pointer: '', message: 'unparseable envelope' }]), [
    'unparseable envelope',
  ]);
});

test('an empty pointer list renders no lines', () => {
  assert.deepEqual(formatAnnotations([]), []);
});
