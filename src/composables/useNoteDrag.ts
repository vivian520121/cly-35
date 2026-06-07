import type { Ref } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useNoteStore } from '@/stores/noteStore'
import { clamp } from '@/utils/id'

interface UseNoteDragOptions {
  noteId: string
  handleRef: Ref<HTMLElement | null>
  noteRef: Ref<HTMLElement | null>
}

export function useNoteDrag(options: UseNoteDragOptions) {
  const { noteId, handleRef, noteRef } = options
  const noteStore = useNoteStore()

  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const startNoteX = ref(0)
  const startNoteY = ref(0)

  function handleStart(e: MouseEvent | TouchEvent) {
    e.preventDefault()
    noteStore.setActiveNote(noteId)
    isDragging.value = true

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    startX.value = clientX
    startY.value = clientY

    const note = noteStore.notes.find(n => n.id === noteId)
    if (note) {
      startNoteX.value = note.x
      startNoteY.value = note.y
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd, { passive: false })
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDragging.value) return
    e.preventDefault()

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const dx = clientX - startX.value
    const dy = clientY - startY.value

    const newX = startNoteX.value + dx
    const newY = startNoteY.value + dy

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const noteWidth = noteRef.value?.offsetWidth || 320
    const noteHeight = noteRef.value?.offsetHeight || 420

    const clampedX = clamp(newX, -noteWidth + 100, viewportWidth - 100)
    const clampedY = clamp(newY, 0, viewportHeight - 100)

    noteStore.updateNotePosition(noteId, clampedX, clampedY)
  }

  function handleEnd(e: MouseEvent | TouchEvent) {
    if (!isDragging.value) return
    isDragging.value = false

    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)

    noteStore.saveToStorage()
  }

  onMounted(() => {
    const handle = handleRef.value
    if (handle) {
      handle.addEventListener('mousedown', handleStart)
      handle.addEventListener('touchstart', handleStart, { passive: false })
    }
  })

  onUnmounted(() => {
    const handle = handleRef.value
    if (handle) {
      handle.removeEventListener('mousedown', handleStart)
      handle.removeEventListener('touchstart', handleStart)
    }
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  })

  return {
    isDragging
  }
}
