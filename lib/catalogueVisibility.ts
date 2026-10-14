export const PUBLIC_CATALOGUE_WHERE = { isPublished: true, deletedAt: null } as const;

export function isPublicCatalogueItem(item: { isPublished: boolean; deletedAt: Date | null } | null | undefined) {
  return Boolean(item && item.isPublished && !item.deletedAt);
}
