import { it, expect, beforeEach } from 'vitest';
import { upsertLink, clearSourceLinks } from '../src/search/linkIndex.js';
import { resolveWikilinks } from '../src/search/wikilinks.js';

beforeEach(() => {
  clearSourceLinks('demo');
});

it('resolves a simple wikilink', () => {
  upsertLink('demo', 'Genus Panthera', 'Genus Panthera.md');
  const result = resolveWikilinks('See [[Genus Panthera]] for more.', 'demo');
  expect(result).toBe('See [Genus Panthera](/read/demo/Genus Panthera.md) for more.');
});

it('resolves a wikilink with display text', () => {
  upsertLink('demo', 'Genus Panthera', 'Genus Panthera.md');
  const result = resolveWikilinks('[[Genus Panthera|the cats]]', 'demo');
  expect(result).toBe('[the cats](/read/demo/Genus Panthera.md)');
});

it('ignores the anchor part of [[name#Heading]]', () => {
  upsertLink('demo', 'Genus Panthera', 'Genus Panthera.md');
  const result = resolveWikilinks('[[Genus Panthera#Diet]]', 'demo');
  expect(result).toBe('[Genus Panthera](/read/demo/Genus Panthera.md)');
});

it('leaves an unresolved link as plain text', () => {
  const result = resolveWikilinks('[[Unknown Page]]', 'demo');
  expect(result).toBe('Unknown Page');
});
