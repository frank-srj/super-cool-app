"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

type Note = {
  id: string
  text: string
  createdAt: string
  updatedAt?: string
}

const STORAGE_KEY = "quick-notes:v1"

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function QuickNote() {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setNotes(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch (e) {
      // ignore
    }
  }, [notes])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Focus quick note with `n` when not typing
      if (e.key.toLowerCase() === "n" && (document.activeElement?.tagName || "") !== "TEXTAREA") {
        e.preventDefault()
        textareaRef.current?.focus()
      }
      // Ctrl/Cmd+Enter to save
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        saveNote()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [text, notes, editingId])

  function saveNote() {
    const now = new Date().toISOString()
    const trimmed = text.trim()
    if (!trimmed) return

    if (editingId) {
      setNotes((s) =>
        s.map((n) => (n.id === editingId ? { ...n, text: trimmed, updatedAt: now } : n))
      )
      setEditingId(null)
    } else {
      const note: Note = { id: uid(), text: trimmed, createdAt: now }
      setNotes((s) => [note, ...s])
    }

    setText("")
    textareaRef.current?.blur()
  }

  function editNote(note: Note) {
    setEditingId(note.id)
    setText(note.text)
    textareaRef.current?.focus()
  }

  function deleteNote(id: string) {
    setNotes((s) => s.filter((n) => n.id !== id))
  }

  async function copyAll() {
    try {
      const payload = notes.map((n) => `- ${n.text}`).join("\n")
      await navigator.clipboard.writeText(payload)
    } catch (e) {
      // ignore
    }
  }

  async function exportJSON() {
    const payload = JSON.stringify(notes, null, 2)
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "quick-notes.json"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Quick note</label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[80px] resize-none rounded-md border px-3 py-2 text-sm leading-snug"
            placeholder="Write an idea, a link, a TODO — press ⌘/Ctrl+Enter to save. Press 'n' to focus."
          />
          <div className="mt-2 flex gap-2">
            <Button onClick={saveNote}>Save</Button>
            <Button onClick={() => { setText(""); setEditingId(null) }}>Clear</Button>
            <Button onClick={copyAll}>Copy all</Button>
            <Button onClick={exportJSON}>Export</Button>
          </div>
        </div>
        <div className="w-48 text-xs text-muted-foreground">
          <div className="mb-2 font-medium">Tips</div>
          <ul className="list-inside list-disc">
            <li>⌘/Ctrl+Enter — save</li>
            <li>n — focus</li>
            <li>Export or copy notes</li>
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium">Recent</h3>
        <div className="flex flex-col gap-2">
          {notes.length === 0 && (
            <div className="text-sm text-muted-foreground">No notes yet — jot something down.</div>
          )}

          {notes.map((note) => (
            <div key={note.id} className="rounded-md border bg-muted px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="whitespace-pre-wrap break-words text-sm">{note.text}</div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-1">
                    <button className="text-xs underline" onClick={() => editNote(note)}>
                      Edit
                    </button>
                    <button className="text-xs underline" onClick={() => deleteNote(note.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
