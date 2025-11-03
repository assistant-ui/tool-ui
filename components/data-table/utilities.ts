// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

/**
 * Sort an array of objects by a key
 */
export function sortData<T extends Record<string, string | number | boolean | null>>(
  data: T[],
  key: string,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    // Handle nulls
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Type-specific comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    // String comparison (case-insensitive)
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
  row: Record<string, string | number | boolean | null>,
  identifierKey?: string
): string {
  const identifier = identifierKey
    ? row[identifierKey]
    : row.name || row.title || row.id || Object.values(row)[0]

  return `${actionLabel} for ${identifier}`
}
