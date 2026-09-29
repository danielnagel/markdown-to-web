import { resolveLink } from './linkIndex.js';

// Matches [[name]], [[name|Display text]] and [[name#Heading]]. The anchor
// group is matched but discarded for v1 - only the target file is linked to.
const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;

// Resolves Obsidian-style wikilinks server-side so the frontend only ever
// has to render plain Markdown links, and the SPA router can intercept them
// for client-side navigation instead of a full page reload.
export function resolveWikilinks(content, source) {
  return content.replace(WIKILINK, (match, name, display) => {
    const basename = name.trim();
    const label = display?.trim() ?? basename;
    const matches = resolveLink(source, basename);

    if (matches.length === 0) {
      return label;
    }
    if (matches.length > 1) {
      console.warn(`[wikilinks] ambiguous link "[[${basename}]]" in source "${source}" - using first match`);
    }

    // Percent-encoded per segment (like FileView.vue does for the API call):
    // a raw space - very common in Obsidian note names - is not allowed in a
    // Markdown link destination, so markdown-it would render the whole link
    // as plain text.
    const href = [source, ...matches[0].path.split('/')].map(encodeURIComponent).join('/');
    return `[${label}](/read/${href})`;
  });
}
