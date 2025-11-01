// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useDataTable } from './data-table'
import { DataTableCell } from './data-table-cell'
import { DataTableActions } from './data-table-actions'

interface DataTableRowProps {
  row: Record<string, any>
  index: number
  className?: string
}

export function DataTableRow({ row, className }: DataTableRowProps) {
  const { columns, actions } = useDataTable()

  return (
    <tr
      className={cn(
        'border-b hover:bg-muted/50 transition-colors',
        className
      )}
    >
      {columns.map((column) => (
        <DataTableCell
          key={column.key}
          value={row[column.key]}
          align={column.align}
        />
      ))}
      {actions && actions.length > 0 && (
        <td className="px-4 py-3">
          <DataTableActions row={row} />
        </td>
      )}
    </tr>
  )
}
