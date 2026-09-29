import { it, expect, beforeEach } from 'vitest';
import { indexFile, clearSource, search } from '../src/search/index.js';

beforeEach(() => {
  clearSource('demo');
  indexFile('demo', 'Tiger.md', 'Tiger', 'The tiger is the largest cat species.');
  indexFile('demo', 'Lion.md', 'Lion', 'The lion lives in prides.');
});

it('finds a matching document by content', () => {
  const results = search('demo', 'largest cat species');
  expect(results).toHaveLength(1);
  expect(results[0].path).toBe('Tiger.md');
});

it('returns no results for an unrelated query', () => {
  expect(search('demo', 'elephant')).toHaveLength(0);
});
