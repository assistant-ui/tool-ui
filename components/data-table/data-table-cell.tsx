// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DataTableCellProps {
  value: string | number | boolean | null
  align?: 'left' | 'right' | 'center'
  className?: string
}

export function DataTableCell({ value, align = 'left', className }: DataTableCellProps) {
  const alignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  }[align]

  const displayValue = value == null ? '—' : String(value)

  return (
    <td
      className={cn(
        'px-4 py-3 text-sm',
        alignClass,
        'max-w-[200px] truncate',
        className
      )}
      title={displayValue}
    >
      {displayValue}
    </td>
  )
}
