export type ClothingVariantInput = {
  size: string;
  color: string;
  stock: string;
  sku: string;
};

function optionKey(value: string) {
  return value.trim().toLowerCase();
}

export function duplicateVariant(variant: ClothingVariantInput): ClothingVariantInput {
  return { size: variant.size, color: variant.color, stock: "0", sku: "" };
}

// Copy only sizes that do not already exist in the target colour.
export function copyColourVariants(
  variants: ClothingVariantInput[],
  sourceColour: string,
  targetColour: string
): ClothingVariantInput[] {
  const colour = targetColour.trim();
  if (!colour) return [];

  const existingSizes = new Set(
    variants.filter((variant) => optionKey(variant.color) === optionKey(colour))
      .map((variant) => optionKey(variant.size))
  );
  const copies: ClothingVariantInput[] = [];

  for (const variant of variants) {
    if (optionKey(variant.color) !== optionKey(sourceColour)) continue;
    const size = optionKey(variant.size);
    if (existingSizes.has(size)) continue;
    existingSizes.add(size);
    copies.push({ ...duplicateVariant(variant), color: colour });
  }
  return copies;
}

export function hasDuplicateVariants(variants: ClothingVariantInput[]) {
  const seen = new Set<string>();
  for (const variant of variants) {
    if (!variant.size.trim() && !variant.color.trim()) continue;
    const key = JSON.stringify([optionKey(variant.size), optionKey(variant.color)]);
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

// Recording identifiers belong to the recording and can be reused across releases.
// Database row IDs belong to one release and must never be carried into a copy.
export function duplicateTracks<T extends { id?: string }>(tracks: T[]): Omit<T, "id">[] {
  return tracks.map((track) => {
    const { id: _id, ...copy } = track;
    return copy;
  });
}
