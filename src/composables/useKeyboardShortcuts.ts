import { onMounted, onUnmounted } from 'vue'
import { useNoteStore } from '@/stores/noteStore'
import type { ToolType } from '@/types'

export function useKeyboardShortcuts() {
  const noteStore = useNoteStore()

  function isTypingTarget(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement
    if (!target) return false
    const tagName = target.tagName
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable) {
      return true
    }
    return false
  }

  function setActiveTool(tool: ToolType) {
    if (noteStore.activeNoteId) {
      noteStore.setTool(noteStore.activeNoteId, tool)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey

    if (isCtrlOrCmd) {
      const key = e.key.toLowerCase()
      
      if (key === 'n') {
        e.preventDefault()
        e.stopImmediatePropagation()
        noteStore.createNote()
        return
      }
      
      if (key === 's') {
        e.preventDefault()
        e.stopImmediatePropagation()
        noteStore.saveToStorage()
        return
      }
      
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        e.stopImmediatePropagation()
        noteStore.undo()
        return
      }
      
      return
    }

    if (isTypingTarget(e)) {
      return
    }

    switch (e.key.toLowerCase()) {
      case 'e':
        e.preventDefault()
        setActiveTool('eraser')
        break
      case 'p':
        e.preventDefault()
        setActiveTool('pen')
        break
      case 't':
        e.preventDefault()
        noteStore.toggleTextEditor()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown, true)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown, true)
  })

  return {}
}
