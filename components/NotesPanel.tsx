'use client'

import { useState } from 'react'
import { Note, Task } from '@/lib/types'
import { ChatBubbleBottomCenterTextIcon, PlusIcon, EyeIcon, CheckIcon } from '@heroicons/react/24/outline'

interface NotesPanelProps {
  notes: Note[]
  tasks: Task[]
  onAddNote: (content: string) => void
  onMarkSeen: (noteId: string) => void
  onMarkProcessed: (noteId: string, relatedTaskId?: string) => void
}

const statusConfig = {
  unseen: {
    border: 'border-l-yellow-400/70',
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
    dot: 'bg-yellow-400 animate-pulse',
    label: 'Unseen',
  },
  seen: {
    border: 'border-l-blue-400/70',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    dot: 'bg-blue-400',
    label: 'Seen',
  },
  processed: {
    border: 'border-l-green-500/50',
    badge: 'bg-green-500/15 text-green-300 border-green-500/40',
    dot: 'bg-green-500',
    label: 'Processed',
  },
}

export default function NotesPanel({ notes, tasks, onAddNote, onMarkSeen, onMarkProcessed }: NotesPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const handleSubmit = () => {
    if (!newNote.trim()) return
    onAddNote(newNote.trim())
    setNewNote('')
    setIsAdding(false)
  }

  const handleProcessSubmit = (noteId: string) => {
    onMarkProcessed(noteId, selectedTaskId || undefined)
    setProcessingNoteId(null)
    setSelectedTaskId('')
  }

  const unseen = notes.filter(n => n.status === 'unseen').length

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-ft-light" />
          <h2 className="text-base font-bold font-heading text-white">Notes</h2>
          {unseen > 0 && (
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unseen}</span>
          )}
        </div>
        <button
          onClick={() => setIsAdding(v => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-ft-light hover:text-white transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          New Note
        </button>
      </div>

      {/* Compose */}
      {isAdding && (
        <div className="bg-klaus-bg border border-klaus-border rounded-lg p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write a note or instruction for V3ktor…"
            className="textarea text-sm resize-none"
            rows={3}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setIsAdding(false); setNewNote('') }} className="text-xs text-gray-500 hover:text-white px-2">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!newNote.trim()}
              className="btn text-xs px-4 disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="text-[10px] text-gray-600">Tip: Cmd+Enter to send</p>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
        {notes.length === 0 ? (
          <div className="text-center py-10 text-klaus-muted">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm italic">No notes yet.</p>
          </div>
        ) : (
          notes.map(note => {
            const cfg = statusConfig[note.status]
            return (
              <div
                key={note.id}
                className={`bg-klaus-bg border border-r border-t border-b border-l-2 border-l-transparent border-klaus-border rounded-lg p-3 flex flex-col gap-2 ${cfg.border}`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">{new Date(note.created_at).toLocaleString()}</span>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>

                {note.related_task_id && (
                  <p className="text-[10px] text-ft-light/60 font-mono">→ {note.related_task_id}</p>
                )}

                {/* Actions */}
                {note.status !== 'processed' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-klaus-border/50">
                    {note.status === 'unseen' && (
                      <button
                        onClick={() => onMarkSeen(note.id)}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        <EyeIcon className="w-3.5 h-3.5" /> Mark Seen
                      </button>
                    )}
                    {note.status === 'seen' && (
                      processingNoteId === note.id ? (
                        <div className="w-full flex flex-col gap-2">
                          <select
                            value={selectedTaskId}
                            onChange={e => setSelectedTaskId(e.target.value)}
                            className="w-full text-xs bg-klaus-card border border-klaus-border rounded px-2 py-1 text-white focus:outline-none focus:border-ft-light"
                          >
                            <option value="">No linked task</option>
                            {tasks.filter(t => t.status !== 'done').map(t => (
                              <option key={t.id} value={t.task_id}>{t.task_id}: {t.title}</option>
                            ))}
                          </select>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setProcessingNoteId(null)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
                            <button onClick={() => handleProcessSubmit(note.id)} className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded font-semibold">
                              <CheckIcon className="w-3 h-3" /> Confirm
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setProcessingNoteId(note.id); setSelectedTaskId('') }}
                          className="flex items-center gap-1 text-[11px] text-green-400 hover:text-green-300 font-semibold transition-colors"
                        >
                          <CheckIcon className="w-3.5 h-3.5" /> Mark Processed
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
