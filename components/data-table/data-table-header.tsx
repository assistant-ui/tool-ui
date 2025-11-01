// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDataTable } from './data-table'

export function DataTableHeader() {
  const { columns, actions } = useDataTable()

  return (
    <thead className="bg-muted/50 border-b sticky top-0">
      <tr>
        {columns.map((column) => (
          <DataTableHead key={column.key} column={column} />
        ))}
        {actions && actions.length > 0 && (
          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
            Actions
          </th>
        )}
      </tr>
    </thead>
  )
}

interface DataTableHeadProps {
  column: {
    key: string
    label: string
    sortable?: boolean
    align?: 'left' | 'right' | 'center'
    width?: string
  }
}

export function DataTableHead({ column }: DataTableHeadProps) {
  const { sortBy, sortDirection, onSort } = useDataTable()
  const isSortable = column.sortable !== false
  const isSorted = sortBy === column.key
  const direction = isSorted ? sortDirection : undefined

  const handleClick = () => {
    if (isSortable && onSort) {
      onSort(column.key)
    }
  }

  const alignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  }[column.align || 'left']

  return (
    <th
      className={cn(
        'px-4 text-sm font-medium text-muted-foreground',
        'py-3 @md:py-3', // Larger touch target on mobile
        alignClass,
        isSortable && 'cursor-pointer select-none hover:text-foreground transition-colors active:bg-muted/50'
      )}
      style={column.width ? { width: column.width } : undefined}
      onClick={handleClick}
      aria-sort={
        isSorted
          ? direction === 'asc'
            ? 'ascending'
            : 'descending'
          : undefined
      }
    >
      <div
        className={cn(
          'inline-flex items-center gap-1',
          column.align === 'right' && 'flex-row-reverse',
          column.align === 'center' && 'justify-center'
        )}
      >
        <span>{column.label}</span>
        {isSortable && (
          <span className="shrink-0">
            {!isSorted && (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
            {isSorted && direction === 'asc' && (
              <ChevronUp className="h-4 w-4" />
            )}
            {isSorted && direction === 'desc' && (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        )}
      </div>
    </th>
  )
}
