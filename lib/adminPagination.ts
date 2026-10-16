export function pageNumbers(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 9) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total]);
  for (let page = Math.max(1, current - 2); page <= Math.min(total, current + 2); page++) pages.add(page);
  const result: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (page - previous === 2) result.push(previous + 1);
    else if (page - previous > 2) result.push("ellipsis");
    result.push(page);
    previous = page;
  }
  return result;
}

export function parsePageInput(value: string, total: number): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 && page <= total ? page : null;
}
