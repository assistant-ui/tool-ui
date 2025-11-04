/**
 * Sort an array of objects by a key
 */
export function sortData<T, K extends Extract<keyof T, string>>(
  data: T[],
  key: K,
  direction: "asc" | "desc",
  locale?: string,
): T[] {
  const get = (obj: T, k: K): unknown => (obj as Record<string, unknown>)[k];
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  return [...data].sort((a, b) => {
    const aVal = get(a, key);
    const bVal = get(b, key);

    // Handle nulls
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Type-specific comparison
    // Numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    // Dates (Date instances)
    if (aVal instanceof Date && bVal instanceof Date) {
      const diff = aVal.getTime() - bVal.getTime()
      return direction === 'asc' ? diff : -diff
    }
    // Booleans: false < true
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      const diff = (aVal === bVal) ? 0 : (aVal ? 1 : -1)
      return direction === 'asc' ? diff : -diff
    }
    // Arrays: compare length
    if (Array.isArray(aVal) && Array.isArray(bVal)) {
      const diff = aVal.length - bVal.length
      return direction === 'asc' ? diff : -diff
    }
    // Strings that look like numbers -> numeric compare
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const numA = parseNumericLike(aVal)
      const numB = parseNumericLike(bVal)
      if (numA != null && numB != null) {
        const diff = numA - numB
        return direction === 'asc' ? diff : -diff
      }
      // ISO-like date strings
      if (/^\d{4}-\d{2}-\d{2}/.test(aVal) && /^\d{4}-\d{2}-\d{2}/.test(bVal)) {
        const da = new Date(aVal).getTime()
        const db = new Date(bVal).getTime()
        const diff = da - db
        return direction === 'asc' ? diff : -diff
      }
    }

    // Fallback: locale-aware string compare with numeric collation
    const aStr = String(aVal)
    const bStr = String(bVal)
    const comparison = collator.compare(aStr, bStr)
    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Format cell values for display
 */
export function formatCellValue(
  value: string | number | boolean | null,
  options?: {
    currency?: string;
    decimals?: number;
    dateFormat?: 'short' | 'long';
  }
): string {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (options?.currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: options.currency,
      }).format(value)
    }
    if (options?.decimals != null) {
      return value.toFixed(options.decimals)
    }
    return value.toLocaleString()
  }

  // ISO date detection and formatting
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return options?.dateFormat === 'long'
          ? date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : date.toLocaleDateString()
      }
    } catch {
      // Fall through to return as-is
    }
  }

  return String(value)
}

/**
 * Generate accessible label for action button
 */
export function getActionLabel(
  actionLabel: string,
  row: Record<string, string | number | boolean | null | (string | number | boolean | null)[]>,
  identifierKey?: string,
): string {
  const identifier = getRowIdentifier(row, identifierKey);
  return identifier ? `${actionLabel} for ${identifier}` : `${actionLabel} row`;
}

/**
 * Return a human-friendly identifier for a row using common keys
 *
 * Accepts any JSON-serializable primitive or array of primitives.
 * Arrays are converted to comma-separated strings.
 */
export function getRowIdentifier(
  row: Record<string, string | number | boolean | null | (string | number | boolean | null)[]>,
  identifierKey?: string,
): string {
  const candidate =
    (identifierKey ? row[identifierKey] : undefined) ??
    (row as Record<string, unknown>).name ??
    (row as Record<string, unknown>).title ??
    (row as Record<string, unknown>).id;

  if (candidate == null) {
    return "";
  }

  // Handle arrays by joining them
  if (Array.isArray(candidate)) {
    return candidate.map(v => v === null ? "null" : String(v)).join(", ");
  }

  return String(candidate).trim();
}

// Internal helpers
function parseNumericLike(input: string): number | null {
  // Normalize whitespace (spaces, NBSPs, thin spaces)
  let s = input.replace(/[\u00A0\u202F\s]/g, '').trim();
  if (!s) return null;

  // Accounting negatives: (1234) -> -1234
  s = s.replace(/^\((.*)\)$/g, '-$1');

  // Strip common currency and percent symbols
  s = s.replace(/[\%$€£¥₩₹₽₺₪₫฿₦₴₡₲₵₸]/g, '');

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma !== -1 && lastDot !== -1) {
    // Decide decimal by whichever occurs last
    const decimalSep = lastComma > lastDot ? ',' : '.';
    const thousandSep = decimalSep === ',' ? '.' : ',';
    s = s.split(thousandSep).join('');
    s = s.replace(decimalSep, '.');
  } else if (lastComma !== -1) {
    // Only comma present
    const frac = s.length - lastComma - 1;
    if (frac === 2 || frac === 3) s = s.replace(/,/g, '.');
    else s = s.replace(/,/g, '');
  } else if (lastDot !== -1) {
    // Only dot present; if multiple dots, treat as thousands and strip
    if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
  }

  if (/^[+-]?(?:\d+\.?\d*|\d*\.\d+)$/.test(s)) {
    const n = Number(s);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}
