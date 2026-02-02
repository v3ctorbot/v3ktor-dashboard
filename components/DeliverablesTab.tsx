'use client'

import { useState } from 'react'
import { Deliverable } from '@/lib/types'

interface DeliverablesTabProps {
  deliverables: Deliverable[]
}

export default function DeliverablesTab({ deliverables }: DeliverablesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredDeliverables = deliverables.filter((del) => {
    const matchesSearch = del.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || del.type === filterType
    return matchesSearch && matchesType
  })

  const uniqueTypes = Array.from(new Set(deliverables.map((d) => d.type)))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-ft-dark font-heading">
          📁 Deliverables / Docs
        </h2>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables..."
            className="px-3 py-2 border border-ft-neutral rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ft-light"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-ft-neutral rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ft-light"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredDeliverables.length === 0 ? (
          <p className="text-gray-500 italic">No deliverables found.</p>
        ) : (
          filteredDeliverables.map((del) => (
            <div key={del.id} className="border border-ft-neutral p-4 rounded-md hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-ft-dark">{del.title}</h3>
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    Type: <span className="font-medium">{del.type}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(del.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                {del.file_path && (
                  <button className="px-3 py-1 text-xs bg-ft-light text-white rounded hover:bg-ft-dark transition-colors">
                    View File
                  </button>
                )}
                {del.external_url && (
                  <a
                    href={del.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs bg-ft-light text-white rounded hover:bg-ft-dark transition-colors"
                  >
                    External Link
                  </a>
                )}
              </div>

              {del.related_task_id && (
                <div className="text-xs text-ft-secondary-2 mt-2 pt-2 border-t border-gray-200">
                  Related to task: {del.related_task_id}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
