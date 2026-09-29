export function findSource(sources, name) {
  const source = sources.find((s) => s.name === name);
  if (!source) {
    const err = new Error(`unknown source "${name}"`);
    err.status = 404;
    throw err;
  }
  return source;
}
