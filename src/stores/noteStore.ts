import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note, NoteStyle, DrawingSettings, TextSettings, ToolType } from '@/types'
import { generateId, getRandomNoteColor } from '@/utils/id'

const STORAGE_KEY = 'sticky-notes-canvas-data'

export const useNoteStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const activeNoteId = ref<string | null>(null)
  const maxZIndex = ref(10)

  const sortedNotes = computed(() => {
    return [...notes.value].sort((a, b) => a.zIndex - b.zIndex)
  })

  const activeNote = computed(() => {
    if (!activeNoteId.value) return null
    return notes.value.find(n => n.id === activeNoteId.value) || null
  })

  function createNote(x?: number, y?: number): Note {
    const defaultX = x ?? 100 + notes.value.length * 30
    const defaultY = y ?? 100 + notes.value.length * 30
    const now = new Date().toISOString()

    const newNote: Note = {
      id: generateId(),
      x: defaultX,
      y: defaultY,
      width: 320,
      height: 420,
      zIndex: ++maxZIndex.value,
      style: {
        backgroundColor: getRandomNoteColor(),
        opacity: 1,
        borderStyle: 'none',
        borderColor: '#CCCCCC',
        borderWidth: 1
      },
      canvasData: '',
      text: {
        content: '',
        color: '#333333',
        fontSize: 14
      },
      drawing: {
        currentTool: 'pen',
        strokeColor: '#000000',
        strokeWidth: 2
      },
      isActive: false,
      createdAt: now,
      updatedAt: now
    }

    notes.value.push(newNote)
    setActiveNote(newNote.id)
    return newNote
  }

  function deleteNote(noteId: string): void {
    const index = notes.value.findIndex(n => n.id === noteId)
    if (index > -1) {
      notes.value.splice(index, 1)
      if (activeNoteId.value === noteId) {
        activeNoteId.value = notes.value.length > 0 ? notes.value[notes.value.length - 1].id : null
      }
    }
  }

  function setActiveNote(noteId: string | null): void {
    activeNoteId.value = noteId
    notes.value.forEach(n => {
      n.isActive = n.id === noteId
    })
    if (noteId) {
      bringToFront(noteId)
    }
  }

  function updateNotePosition(noteId: string, x: number, y: number): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.x = x
      note.y = y
      note.updatedAt = new Date().toISOString()
    }
  }

  function updateNoteStyle(noteId: string, style: Partial<NoteStyle>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.style = { ...note.style, ...style }
      note.updatedAt = new Date().toISOString()
    }
  }

  function updateNoteDrawing(noteId: string, drawing: Partial<DrawingSettings>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.drawing = { ...note.drawing, ...drawing }
      note.updatedAt = new Date().toISOString()
    }
  }

  function updateNoteText(noteId: string, text: Partial<TextSettings>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.text = { ...note.text, ...text }
      note.updatedAt = new Date().toISOString()
    }
  }

  function updateNoteCanvasData(noteId: string, canvasData: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.canvasData = canvasData
      note.updatedAt = new Date().toISOString()
    }
  }

  function setTool(noteId: string, tool: ToolType): void {
    updateNoteDrawing(noteId, { currentTool: tool })
  }

  function bringToFront(noteId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.zIndex = ++maxZIndex.value
      note.updatedAt = new Date().toISOString()
    }
  }

  function sendToBack(noteId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      const minZIndex = Math.min(...notes.value.map(n => n.zIndex))
      note.zIndex = minZIndex - 1
      notes.value.forEach(n => {
        if (n.id !== noteId) {
          n.zIndex++
        }
      })
      maxZIndex.value = Math.max(...notes.value.map(n => n.zIndex))
      note.updatedAt = new Date().toISOString()
    }
  }

  function clearAllNotes(): void {
    notes.value = []
    activeNoteId.value = null
    maxZIndex.value = 10
  }

  function saveToStorage(): void {
    try {
      const data = {
        notes: notes.value,
        maxZIndex: maxZIndex.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }

  function loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        notes.value = data.notes || []
        maxZIndex.value = data.maxZIndex || 10
        activeNoteId.value = null
        notes.value.forEach(n => n.isActive = false)
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }

  return {
    notes,
    sortedNotes,
    activeNoteId,
    activeNote,
    maxZIndex,
    createNote,
    deleteNote,
    setActiveNote,
    updateNotePosition,
    updateNoteStyle,
    updateNoteDrawing,
    updateNoteText,
    updateNoteCanvasData,
    setTool,
    bringToFront,
    sendToBack,
    clearAllNotes,
    saveToStorage,
    loadFromStorage
  }
})
