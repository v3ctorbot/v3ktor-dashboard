'use client'

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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-ft-dark font-heading">
        💬 Notes (User → V3ktor Communication)
      </h2>

      {/* Add New Note */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note or instruction for V3ktor..."
          className="w-full p-3 border border-ft-neutral rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ft-light"
          rows={3}
        />
        <button
          type="submit"
          disabled={!newNote.trim()}
          className="mt-2 px-4 py-2 bg-ft-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ft-secondary-1 transition-colors"
        >
          Add Note
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic">No notes yet.</p>
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
