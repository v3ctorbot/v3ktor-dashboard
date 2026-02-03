'use client'

import { useState } from 'react'
import { Deliverable } from '@/lib/types'

interface DeliverablesTabProps {
  deliverables: Deliverable[]
}

import { supabase } from '@/lib/supabase'
import { PlusIcon } from '@heroicons/react/24/outline'

interface DeliverablesTabProps {
  deliverables: Deliverable[]
}

export default function DeliverablesTab({ deliverables }: DeliverablesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('document')
  const [newUrl, setNewUrl] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newRelatedTaskId, setNewRelatedTaskId] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const filteredDeliverables = deliverables.filter((del) => {
    const matchesSearch = del.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || del.type === filterType
    return matchesSearch && matchesType
  })

  const uniqueTypes = Array.from(new Set(deliverables.map((d) => d.type)))

  const handleAddDeliverable = async () => {
    if (!newTitle.trim()) return

    setIsUploading(true)
    let filePath = null

    try {
      // 1. Upload File if present
      if (newFile) {
        const fileExt = newFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('deliverables')
          .upload(fileName, newFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert('Failed to upload file. Ensure "deliverables" bucket exists.')
          setIsUploading(false)
          return
        }
        filePath = data?.path
      }

      // 2. Insert Record
      const { error: insertError } = await supabase
        .from('deliverables')
        .insert({
          title: newTitle,
          type: newType,
          file_path: filePath,
          external_url: newUrl || null,
          related_task_id: newRelatedTaskId || null
        })

      if (insertError) {
        console.error('Insert error:', insertError)
      } else {
        // Reset form
        setNewTitle('')
        setNewType('document')
        setNewUrl('')
        setNewFile(null)
        setNewRelatedTaskId('')
        setIsAdding(false)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="header-icon text-ft-dark" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <h2 className="text-xl font-bold text-ft-dark font-heading">Deliverables</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search & Filter */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="input text-sm w-32 sm:w-48"
          />
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 rounded-full hover:bg-gray-100 text-ft-primary-light transition-colors"
            title="Add Deliverable"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn text-sm">
          <h3 className="font-semibold text-gray-700 mb-3">New Deliverable</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-ft-light"
                placeholder="Report Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-ft-light"
              >
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="code">Code</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File (Optional)</label>
              <input
                type="file"
                onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">External URL (Optional)</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-ft-light"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Related Task ID (Optional)</label>
              <input
                type="text"
                value={newRelatedTaskId}
                onChange={(e) => setNewRelatedTaskId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-ft-light"
                placeholder="TASK-123"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDeliverable}
              disabled={isUploading || !newTitle}
              className="px-3 py-1.5 text-xs bg-ft-primary-light text-white rounded hover:bg-opacity-90 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Add Deliverable'}
            </button>
          </div>
        </div>
      )}

      {/* Deliverables List */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto">
        {filteredDeliverables.length === 0 ? (
          <p className="text-gray-500 italic">No deliverables found.</p>
        ) : (
          filteredDeliverables.map((del) => (
            <div key={del.id} className="border border-gray-100 p-4 rounded-md hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start mb-2 gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{del.title}</h3>
                  <div className="text-xs text-gray-500 mt-1 font-mono">Type: <span className="font-medium">{del.type}</span></div>
                  <div className="text-xs text-gray-500">Created: {new Date(del.created_at).toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {del.file_path && (
                    <button className="px-3 py-1 text-xs bg-ft-light text-white rounded hover:bg-ft-dark transition-colors">View File</button>
                  )}
                  {del.external_url && (
                    <a href={del.external_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-xs bg-ft-light text-white rounded hover:bg-ft-dark transition-colors">External Link</a>
                  )}
                </div>
              </div>

              {del.related_task_id && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">Related to task: {del.related_task_id}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
