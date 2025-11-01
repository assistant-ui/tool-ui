// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

'use client'

import * as React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDataTable } from './data-table'

interface DataTableActionsProps {
  row: Record<string, any>
}

export function DataTableActions({ row }: DataTableActionsProps) {
  const { actions, onAction, messageId } = useDataTable()

  if (!actions || !onAction) return null

  // 1-2 actions: inline buttons
  if (actions.length <= 2) {
    return (
      <div className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'default'}
            size="sm"
            onClick={() => onAction(action.id, row, { messageId })}
          >
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  // 3+ actions: dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => onAction(action.id, row, { messageId })}
            className={
              action.variant === 'destructive'
                ? 'text-destructive focus:text-destructive'
                : undefined
            }
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
