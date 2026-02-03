'use client'

import { useState } from 'react'
import { Note } from '@/lib/types'

interface NotesPanelProps {
  notes: Note[]
  onAddNote: (content: string) => void
  onMarkSeen: (noteId: string) => void
  onMarkProcessed: (noteId: string) => void
}

export default function NotesPanel({ notes, onAddNote, onMarkSeen, onMarkProcessed }: NotesPanelProps) {
  const [newNote, setNewNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote('')
    }
  }

  const statusStyles = {
    unseen: 'bg-yellow-100 border-yellow-300',
    seen: 'bg-blue-100 border-blue-300',
    processed: 'bg-green-100 border-green-300',
  }

  const statusLabels = {
    unseen: '📬 Unseen',
    seen: '👁️ Seen',
    processed: '✅ Processed',
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="header-icon text-ft-dark" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H7l-5 3V5z" />
        </svg>
        <h2 className="text-xl font-bold text-ft-dark font-heading">Notes</h2>
      </div>

      {/* Add New Note */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note or instruction for V3ktor..."
          className="input min-h-[80px]"
          rows={3}
        />
        <button
          type="submit"
          disabled={!newNote.trim()}
          className="mt-2 btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Note
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="rounded-full bg-gray-100 flex items-center justify-center p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon text-gray-400" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H7l-5 3V5z" />
              </svg>
            </div>
            <p className="italic">No notes yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`p-4 rounded-lg border-2 ${statusStyles[note.status]}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`font-semibold ${statusLabels[note.status].includes('Unseen') ? 'text-yellow-800' : ''}`}>
                  {statusLabels[note.status]}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-800 mb-3">{note.content}</p>

              {note.related_task_id && (
                <div className="text-xs text-ft-dark font-medium">
                  Related to task: {note.related_task_id}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-300">
                {note.status === 'unseen' && (
                  <button
                    onClick={() => onMarkSeen(note.id)}
                    className="px-3 py-1 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    Mark Seen
                  </button>
                )}
                {note.status === 'seen' && (
                  <button
                    onClick={() => onMarkProcessed(note.id)}
                    className="px-3 py-1 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                  >
                    Mark Processed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
