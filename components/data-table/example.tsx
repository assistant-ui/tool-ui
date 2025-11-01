// @assistant-ui/widgets v0.1.0 - data-table
// Example usage of DataTable component

'use client'

import { useState } from 'react'
import { DataTable } from './index'

// Sample data
const sampleColumns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Company' },
  { key: 'price', label: 'Price', align: 'right' as const },
  { key: 'change', label: 'Change %', align: 'right' as const },
  { key: 'volume', label: 'Volume', align: 'right' as const },
]

const sampleRows = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: 2.3, volume: 52430000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.50, change: -0.8, volume: 28920000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.00, change: 1.2, volume: 31250000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.75, change: 3.1, volume: 45680000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.80, change: -1.5, volume: 98540000 },
]

const sampleActions = [
  { id: 'view', label: 'View Details', variant: 'secondary' as const },
  { id: 'buy', label: 'Buy', variant: 'default' as const },
  { id: 'sell', label: 'Sell', variant: 'destructive' as const },
]

export function DataTableExample() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Basic Table</h2>
        <DataTable columns={sampleColumns} rows={sampleRows} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">With Actions</h2>
        <DataTable
          columns={sampleColumns}
          rows={sampleRows}
          actions={sampleActions}
          onAction={(actionId, row) => {
            console.log(`Action: ${actionId}`, row)
            alert(`${actionId} ${row.symbol}`)
          }}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Empty State</h2>
        <DataTable
          columns={sampleColumns}
          rows={[]}
          emptyMessage="No stocks found. Try adjusting your filters."
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Loading State</h2>
        <div className="space-y-2">
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Toggle Loading
          </button>
          <DataTable
            columns={sampleColumns}
            rows={sampleRows}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">With Max Height</h2>
        <DataTable
          columns={sampleColumns}
          rows={[...sampleRows, ...sampleRows, ...sampleRows]}
          maxHeight="300px"
        />
      </div>
    </div>
  )
}
