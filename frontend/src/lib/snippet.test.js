import { it, expect } from 'vitest';
import { parseSnippet } from './snippet';

it('parses a snippet with one highlighted match', () => {
  const snippet = 'The tiger is large.';
  expect(parseSnippet(snippet)).toEqual([
    { text: 'The ', highlighted: false },
    { text: 'tiger', highlighted: true },
    { text: ' is large.', highlighted: false },
  ]);
});

it('parses a snippet with no matches', () => {
  expect(parseSnippet('plain text')).toEqual([{ text: 'plain text', highlighted: false }]);
});

it('parses multiple matches', () => {
  const snippet = 'a and b';
  expect(parseSnippet(snippet)).toEqual([
    { text: 'a', highlighted: true },
    { text: ' and ', highlighted: false },
    { text: 'b', highlighted: true },
  ]);
});
