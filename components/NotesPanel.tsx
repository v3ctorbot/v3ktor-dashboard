'use client'

import { useState } from 'react'
import { Note, Task } from '@/lib/types'

interface NotesPanelProps {
  notes: Note[]
  tasks: Task[]
  onAddNote: (content: string) => void
  onMarkSeen: (noteId: string) => void
  onMarkProcessed: (noteId: string, relatedTaskId?: string) => void
}

import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'

export default function NotesPanel({ notes, tasks, onAddNote, onMarkSeen, onMarkProcessed }: NotesPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote('')
    }
  }

  const handleProcessSubmit = (noteId: string) => {
    onMarkProcessed(noteId, selectedTaskId || undefined)
    setProcessingNoteId(null)
    setSelectedTaskId('')
  }

  const statusStyles = {
    unseen: 'bg-yellow-500/10 border-yellow-500/30',
    seen: 'bg-blue-500/10 border-blue-500/30',
    processed: 'bg-green-500/10 border-green-500/30',
  }

  const statusLabels = {
    unseen: '📬 Unseen',
    seen: '👁️ Seen',
    processed: '✅ Processed',
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 border-b border-klaus-border pb-3">
        <ChatBubbleBottomCenterTextIcon className="text-ft-light w-5 h-5" />
        <h2 className="text-xl font-bold text-white font-heading">Notes</h2>
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
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newNote.trim()}
            className="mt-2 text-xs font-bold uppercase tracking-wider bg-ft-light text-white px-4 py-2 rounded hover:bg-ft-light/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add Note
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500 h-24">
            <div className="rounded-full bg-klaus-bg border border-klaus-border flex items-center justify-center p-2">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-600" />
            </div>
            <p className="italic text-xs">No notes yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`p-4 rounded-lg border-l-4 border-y border-r border-klaus-border ${statusStyles[note.status]}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`font-semibold text-xs uppercase tracking-wide ${note.status === 'unseen' ? 'text-yellow-400' : note.status === 'seen' ? 'text-blue-400' : 'text-green-400'
                  }`}>
                  {statusLabels[note.status]}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{note.content}</p>

              {note.related_task_id && (
                <div className="text-xs text-ft-light font-medium mb-2 border-t border-white/5 pt-2">
                  <span className="text-klaus-muted">Related to task:</span> {note.related_task_id}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-2 border-t border-white/5">
                {note.status === 'unseen' && (
                  <button
                    onClick={() => onMarkSeen(note.id)}
                    className="px-3 py-1 text-xs bg-klaus-bg border border-blue-500/30 text-blue-300 rounded hover:bg-blue-500/20 transition-colors"
                  >
                    Mark Seen
                  </button>
                )}
                {note.status === 'seen' && (
                  <div className="flex-1">
                    {processingNoteId === note.id ? (
                      <div className="bg-klaus-bg p-2 rounded border border-klaus-border animate-in fade-in zoom-in-95">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Link Task (Optional):</label>
                        <select
                          value={selectedTaskId}
                          onChange={(e) => setSelectedTaskId(e.target.value)}
                          className="w-full text-xs bg-klaus-card border border-klaus-border rounded px-2 py-1 mb-2 text-white focus:outline-none focus:border-ft-light"
                        >
                          <option value="">-- No Linked Task --</option>
                          {tasks.map(t => (
                            <option key={t.id} value={t.task_id}>{t.task_id}: {t.title}</option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setProcessingNoteId(null)}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleProcessSubmit(note.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500"
                          >
                            Confirm Processed
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setProcessingNoteId(note.id)
                          setSelectedTaskId('')
                        }}
                        className="px-3 py-1 text-xs bg-klaus-bg border border-green-500/30 text-green-300 rounded hover:bg-green-500/20 transition-colors"
                      >
                        Mark Processed
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
