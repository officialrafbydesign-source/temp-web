/** Keep catalogue spelling when reusing a tag; compare without case or extra spaces. */
export function normaliseTags(values: readonly string[], existing: readonly string[] = []): string[] {
  const clean = (value: string) => value.trim().replace(/\s+/g, " ");
  const catalogue = new Map<string, string>();
  for (const value of existing) {
    const tag = clean(value);
    if (tag && !catalogue.has(tag.toLowerCase())) catalogue.set(tag.toLowerCase(), tag);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const tag = clean(value);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    result.push(catalogue.get(key) || tag);
  }
  return result;
}

export function suggestTags(existing: readonly string[], selected: readonly string[], query: string): string[] {
  const selectedKeys = new Set(normaliseTags(selected).map((tag) => tag.toLowerCase()));
  const search = query.trim().replace(/\s+/g, " ").toLowerCase();
  return normaliseTags(existing)
    .filter((tag) => !selectedKeys.has(tag.toLowerCase()) && tag.toLowerCase().includes(search))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8);
}
