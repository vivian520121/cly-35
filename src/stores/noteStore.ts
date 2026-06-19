import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Note, NoteStyle, NoteTag, DrawingSettings, TextSettings, ToolType, TextBox, TextBoxStyle, ImageBox, ImageBoxStyle } from '@/types'
import { generateId, getRandomNoteColor } from '@/utils/id'

const STORAGE_KEY = 'sticky-notes-canvas-data'
const MAX_HISTORY = 50

interface HistoryState {
  notes: Note[]
  maxZIndex: number
  hiddenTags: string[]
}

export const useNoteStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const activeNoteId = ref<string | null>(null)
  const maxZIndex = ref(10)
  const hiddenTags = ref<Set<NoteTag>>(new Set())
  const history = ref<HistoryState[]>([])
  const historyIndex = ref(-1)
  const isUndoing = ref(false)
  const textEditorToggleCounter = ref(0)

  const sortedNotes = computed(() => {
    return [...notes.value].sort((a, b) => a.zIndex - b.zIndex)
  })

  const filteredSortedNotes = computed(() => {
    return sortedNotes.value.filter(n => !hiddenTags.value.has(n.tag))
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
      textBoxes: [],
      imageBoxes: [],
      tag: '',
      isActive: false,
      isMinimized: false,
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

  function setNoteTag(noteId: string, tag: NoteTag): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.tag = tag
      note.updatedAt = new Date().toISOString()
    }
  }

  function toggleTagFilter(tag: NoteTag): void {
    const newSet = new Set(hiddenTags.value)
    if (newSet.has(tag)) {
      newSet.delete(tag)
    } else {
      newSet.add(tag)
    }
    hiddenTags.value = newSet
  }

  function isTagHidden(tag: NoteTag): boolean {
    return hiddenTags.value.has(tag)
  }

  function toggleMinimize(noteId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.isMinimized = !note.isMinimized
      note.updatedAt = new Date().toISOString()
    }
  }

  function addTextBox(noteId: string, x: number, y: number): TextBox {
    const note = notes.value.find(n => n.id === noteId)
    const newTextBox: TextBox = {
      id: generateId(),
      x,
      y,
      width: 180,
      height: 40,
      content: '',
      style: {
        color: '#333333',
        fontSize: 16,
        bold: false
      },
      isActive: true,
      isEditing: true
    }
    if (note) {
      note.textBoxes.forEach(tb => {
        tb.isActive = false
        tb.isEditing = false
      })
      note.textBoxes.push(newTextBox)
      note.updatedAt = new Date().toISOString()
    }
    return newTextBox
  }

  function updateTextBox(noteId: string, textBoxId: string, updates: Partial<TextBox>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const textBox = note.textBoxes.find(tb => tb.id === textBoxId)
    if (textBox) {
      Object.assign(textBox, updates)
      note.updatedAt = new Date().toISOString()
    }
  }

  function updateTextBoxStyle(noteId: string, textBoxId: string, styleUpdates: Partial<TextBoxStyle>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const textBox = note.textBoxes.find(tb => tb.id === textBoxId)
    if (textBox) {
      textBox.style = { ...textBox.style, ...styleUpdates }
      note.updatedAt = new Date().toISOString()
    }
  }

  function deleteTextBox(noteId: string, textBoxId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const index = note.textBoxes.findIndex(tb => tb.id === textBoxId)
    if (index > -1) {
      note.textBoxes.splice(index, 1)
      note.updatedAt = new Date().toISOString()
    }
  }

  function setActiveTextBox(noteId: string, textBoxId: string | null): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    note.textBoxes.forEach(tb => {
      tb.isActive = tb.id === textBoxId
      if (tb.id !== textBoxId) {
        tb.isEditing = false
      }
    })
  }

  function getActiveTextBox(noteId: string): TextBox | null {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return null
    return note.textBoxes.find(tb => tb.isActive) || null
  }

  function addImageBox(noteId: string, x: number, y: number, src: string, width: number, height: number): ImageBox {
    const note = notes.value.find(n => n.id === noteId)
    const maxImgZIndex = note ? Math.max(0, ...note.imageBoxes.map(img => img.zIndex)) : 0
    const newImageBox: ImageBox = {
      id: generateId(),
      x,
      y,
      width,
      height,
      src,
      style: {
        opacity: 1,
        rotation: 0,
        borderRadius: 0
      },
      isActive: true,
      zIndex: maxImgZIndex + 1
    }
    if (note) {
      note.imageBoxes.forEach(img => {
        img.isActive = false
      })
      note.imageBoxes.push(newImageBox)
      note.updatedAt = new Date().toISOString()
    }
    return newImageBox
  }

  function updateImageBox(noteId: string, imageBoxId: string, updates: Partial<ImageBox>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const imageBox = note.imageBoxes.find(img => img.id === imageBoxId)
    if (imageBox) {
      Object.assign(imageBox, updates)
      note.updatedAt = new Date().toISOString()
    }
  }

  function updateImageBoxStyle(noteId: string, imageBoxId: string, styleUpdates: Partial<ImageBoxStyle>): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const imageBox = note.imageBoxes.find(img => img.id === imageBoxId)
    if (imageBox) {
      imageBox.style = { ...imageBox.style, ...styleUpdates }
      note.updatedAt = new Date().toISOString()
    }
  }

  function deleteImageBox(noteId: string, imageBoxId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const index = note.imageBoxes.findIndex(img => img.id === imageBoxId)
    if (index > -1) {
      note.imageBoxes.splice(index, 1)
      note.updatedAt = new Date().toISOString()
    }
  }

  function setActiveImageBox(noteId: string, imageBoxId: string | null): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    note.imageBoxes.forEach(img => {
      img.isActive = img.id === imageBoxId
    })
    if (imageBoxId) {
      bringImageBoxToFront(noteId, imageBoxId)
    }
  }

  function bringImageBoxToFront(noteId: string, imageBoxId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const imageBox = note.imageBoxes.find(img => img.id === imageBoxId)
    if (imageBox) {
      const maxZIndex = Math.max(...note.imageBoxes.map(img => img.zIndex))
      imageBox.zIndex = maxZIndex + 1
      note.updatedAt = new Date().toISOString()
    }
  }

  function sendImageBoxToBack(noteId: string, imageBoxId: string): void {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const imageBox = note.imageBoxes.find(img => img.id === imageBoxId)
    if (imageBox) {
      const minZIndex = Math.min(...note.imageBoxes.map(img => img.zIndex))
      imageBox.zIndex = minZIndex - 1
      note.imageBoxes.forEach(img => {
        if (img.id !== imageBoxId) {
          img.zIndex++
        }
      })
      note.updatedAt = new Date().toISOString()
    }
  }

  function clearAllNotes(): void {
    notes.value = []
    activeNoteId.value = null
    maxZIndex.value = 10
  }

  const saveToastVisible = ref(false)
  const saveToastMessage = ref('')

  function showSaveToast(message: string) {
    saveToastMessage.value = message
    saveToastVisible.value = true
    setTimeout(() => {
      saveToastVisible.value = false
    }, 1500)
  }

  function saveToStorage(): void {
    try {
      const data = {
        notes: notes.value,
        maxZIndex: maxZIndex.value,
        hiddenTags: [...hiddenTags.value]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      showSaveToast('已保存')
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
      showSaveToast('保存失败')
    }
  }

  function loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        notes.value = (data.notes || []).map((n: Note) => ({
          ...n,
          isMinimized: n.isMinimized ?? false,
          tag: n.tag ?? '',
          textBoxes: n.textBoxes ?? [],
          imageBoxes: n.imageBoxes ?? []
        }))
        maxZIndex.value = data.maxZIndex || 10
        hiddenTags.value = new Set(data.hiddenTags || [])
        activeNoteId.value = null
        notes.value.forEach(n => n.isActive = false)
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }

  function saveHistory(): void {
    if (isUndoing.value) return
    const state: HistoryState = {
      notes: JSON.parse(JSON.stringify(notes.value)),
      maxZIndex: maxZIndex.value,
      hiddenTags: [...hiddenTags.value]
    }
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(state)
    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function undo(): boolean {
    if (historyIndex.value <= 0) return false
    isUndoing.value = true
    try {
      historyIndex.value--
      const state = history.value[historyIndex.value]
      notes.value = JSON.parse(JSON.stringify(state.notes))
      maxZIndex.value = state.maxZIndex
      hiddenTags.value = new Set(state.hiddenTags as NoteTag[])
      activeNoteId.value = null
      notes.value.forEach(n => n.isActive = false)
      saveToStorage()
      return true
    } finally {
      setTimeout(() => {
        isUndoing.value = false
      }, 50)
    }
  }

  function canUndo(): boolean {
    return historyIndex.value > 0
  }

  function toggleTextEditor(): void {
    textEditorToggleCounter.value++
  }

  watch(
    () => [notes.value, maxZIndex.value, hiddenTags.value],
    () => {
      saveHistory()
    },
    { deep: true }
  )

  return {
    notes,
    sortedNotes,
    filteredSortedNotes,
    activeNoteId,
    activeNote,
    maxZIndex,
    hiddenTags,
    textEditorToggleCounter,
    saveToastVisible,
    saveToastMessage,
    createNote,
    deleteNote,
    setActiveNote,
    updateNotePosition,
    updateNoteStyle,
    updateNoteDrawing,
    updateNoteText,
    updateNoteCanvasData,
    setTool,
    setNoteTag,
    toggleTagFilter,
    isTagHidden,
    bringToFront,
    sendToBack,
    toggleMinimize,
    addTextBox,
    updateTextBox,
    updateTextBoxStyle,
    deleteTextBox,
    setActiveTextBox,
    getActiveTextBox,
    addImageBox,
    updateImageBox,
    updateImageBoxStyle,
    deleteImageBox,
    setActiveImageBox,
    bringImageBoxToFront,
    sendImageBoxToBack,
    clearAllNotes,
    saveToStorage,
    loadFromStorage,
    undo,
    canUndo,
    saveHistory,
    toggleTextEditor
  }
})
