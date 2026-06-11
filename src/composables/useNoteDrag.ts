import type { Ref } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useNoteStore } from '@/stores/noteStore'
import { clamp } from '@/utils/id'

const SNAP_THRESHOLD = 20
const PREVIEW_OPACITY = 0.5

interface UseNoteDragOptions {
  noteId: string
  handleRef: Ref<HTMLElement | null>
  noteRef: Ref<HTMLElement | null>
}

export function useNoteDrag(options: UseNoteDragOptions) {
  const { noteId, handleRef, noteRef } = options
  const noteStore = useNoteStore()

  const isDragging = ref(false)
  const isSnapped = ref(false)

  const startX = ref(0)
  const startY = ref(0)
  const startNoteX = ref(0)
  const startNoteY = ref(0)
  let rafId: number | null = null
  let pendingX = 0
  let pendingY = 0

  function snapToEdge(value: number, min: number, max: number): number {
    if (Math.abs(value - min) <= SNAP_THRESHOLD) return min
    if (Math.abs(value - max) <= SNAP_THRESHOLD) return max
    return value
  }

  function calcSnappedPosition(rawX: number, rawY: number) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const nw = noteRef.value?.offsetWidth || 320
    const nh = noteRef.value?.offsetHeight || 420

    const clampedX = clamp(rawX, -nw + 100, vw - 100)
    const clampedY = clamp(rawY, 0, vh - 100)

    const snappedX = snapToEdge(clampedX, 0, vw - nw)
    const snappedY = snapToEdge(clampedY, 0, vh - nh)

    const snapped = snappedX !== clampedX || snappedY !== clampedY

    return { x: snappedX, y: snappedY, snapped }
  }

  function flushPosition() {
    noteStore.updateNotePosition(noteId, pendingX, pendingY)
    rafId = null
  }

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

    document.addEventListener('mousemove', handleMove, { passive: false })
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd, { passive: false })

    document.body.classList.add('drag-lock')
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

    const rawX = startNoteX.value + dx
    const rawY = startNoteY.value + dy

    const { x: snappedX, y: snappedY, snapped } = calcSnappedPosition(rawX, rawY)

    isSnapped.value = snapped

    pendingX = snappedX
    pendingY = snappedY

    if (!rafId) {
      rafId = requestAnimationFrame(flushPosition)
    }
  }

  function handleEnd() {
    if (!isDragging.value) return
    isDragging.value = false
    isSnapped.value = false

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)

    document.body.classList.remove('drag-lock')

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

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    document.body.classList.remove('drag-lock')
  })

  return {
    isDragging,
    isSnapped
  }
}
