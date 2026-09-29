// Must match backend/src/search/index.js SNIPPET_MATCH_START/END. These are
// control characters, not HTML tags: the snippet is a raw substring of file
// content (a note could itself contain "<script>" as plain text), so it's
// parsed into segments here and rendered via text interpolation - never
// v-html - by the caller (see views/SearchView.vue).
const MATCH_START = '';
const MATCH_END = '';

export function parseSnippet(snippet) {
  const parts = [];
  let rest = snippet;

  while (rest.length > 0) {
    const start = rest.indexOf(MATCH_START);
    if (start === -1) {
      parts.push({ text: rest, highlighted: false });
      break;
    }
    if (start > 0) {
      parts.push({ text: rest.slice(0, start), highlighted: false });
    }
    const end = rest.indexOf(MATCH_END, start);
    const matchEnd = end === -1 ? rest.length : end;
    parts.push({ text: rest.slice(start + 1, matchEnd), highlighted: true });
    rest = end === -1 ? '' : rest.slice(end + 1);
  }

  return parts;
}
