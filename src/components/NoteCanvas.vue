<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import type { ToolType } from '@/types'
import { useCanvasDrawing } from '@/composables/useCanvasDrawing'
import { useNoteStore } from '@/stores/noteStore'

interface Props {
  noteId: string
  canvasData: string
  tool: ToolType
  strokeColor: string
  strokeWidth: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'canvasChange', dataUrl: string): void
}>()

const noteStore = useNoteStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

const toolRef = computed(() => props.tool)
const strokeColorRef = computed(() => props.strokeColor)
const strokeWidthRef = computed(() => props.strokeWidth)
const canvasDataRef = computed(() => props.canvasData)

function handleCanvasChange(dataUrl: string) {
  emit('canvasChange', dataUrl)
}

const { clear, initCanvas } = useCanvasDrawing({
  canvasRef: canvasRef as Ref<HTMLCanvasElement | null>,
  tool: toolRef,
  strokeColor: strokeColorRef,
  strokeWidth: strokeWidthRef,
  canvasData: canvasDataRef,
  onCanvasChange: handleCanvasChange
})

function handleCanvasClick() {
  noteStore.setActiveNote(props.noteId)
}

defineExpose({
  canvasRef,
  clear,
  initCanvas
})
</script>

<template>
  <div
    class="flex-1 relative overflow-hidden"
    @mousedown.stop="handleCanvasClick"
    @touchstart.stop="handleCanvasClick"
  >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full cursor-crosshair"
      :class="{
        'cursor-pen': tool === 'pen',
        'cursor-erase': tool === 'eraser',
        'cursor-crosshair': tool === 'line' || tool === 'rect' || tool === 'circle'
      }"
    ></canvas>
  </div>
</template>

<style scoped>
.cursor-pen {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2'%3E%3Cpath d='M12 19l7-7 3 3-7 7-3-3z'/%3E%3Cpath d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z'/%3E%3Cpath d='M2 2l7.586 7.586'/%3E%3Ccircle cx='11' cy='11' r='2'/%3E%3C/svg%3E") 0 24, crosshair;
}
.cursor-erase {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2'%3E%3Cpath d='M20 20H7L3 16l13-13 4 4z'/%3E%3Cpath d='M18 18l-3-3'/%3E%3C/svg%3E") 12 12, crosshair;
}
</style>
