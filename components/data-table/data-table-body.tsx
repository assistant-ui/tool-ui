// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

'use client'

import * as React from 'react'
import { useDataTable } from './data-table'
import { DataTableRow } from './data-table-row'

export function DataTableBody() {
  const { rows } = useDataTable()

  return (
    <tbody>
      {rows.map((row, index) => (
        <DataTableRow key={index} row={row} index={index} />
      ))}
    </tbody>
  )
}
