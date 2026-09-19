export type PageInfo = { page: number; totalPages: number; skip: number; take: number };

/** `?page=` qiymatidan xavfsiz sahifa raqami (1..totalPages) va DB skip/take. */
export function paginate(rawPage: string | undefined, total: number, perPage: number): PageInfo {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), totalPages) : 1;
  return { page, totalPages, skip: (page - 1) * perPage, take: perPage };
}

/** Ko'rsatiladigan sahifa raqamlari; uzilishlar null: [1, null, 4, 5, 6, null, 12] */
export function pageWindow(page: number, totalPages: number, radius = 1): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let p = 1; p <= totalPages; p++) {
    const near = Math.abs(p - page) <= radius;
    if (p === 1 || p === totalPages || near) pages.push(p);
    else if (pages.at(-1) !== null) pages.push(null);
  }
  return pages;
}
