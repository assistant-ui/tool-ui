// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

/**
 * Sort an array of objects by a key
 */
export function sortData<
  T extends Record<string, string | number | boolean | null | Date | string[]>,
>(data: T[], key: string, direction: "asc" | "desc"): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

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

    // Fallback: string compare (case-insensitive)
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    const comparison = aStr.localeCompare(bStr)
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
  row: Record<string, string | number | boolean | null | Date | string[]>,
  identifierKey?: string,
): string {
  const identifier = identifierKey
    ? row[identifierKey]
    : row.name || row.title || row.id || Object.values(row)[0]

  return `${actionLabel} for ${identifier}`
}

// Internal helpers
function parseNumericLike(input: string): number | null {
  // Remove common number formatting (commas, spaces)
  const normalized = input.replace(/[,\s]/g, '')
  if (/^[+-]?(?:\d+\.?\d*|\d*\.\d+)$/.test(normalized)) {
    const n = Number(normalized)
    return isNaN(n) ? null : n
  }
  return null
}
