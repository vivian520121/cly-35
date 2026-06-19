<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import type { ToolType, TextBox, TextBoxStyle, ImageBox, ImageBoxStyle } from '@/types'
import { useCanvasDrawing } from '@/composables/useCanvasDrawing'
import { useNoteStore } from '@/stores/noteStore'
import TextBoxComp from './TextBox.vue'
import ImageBoxComp from './ImageBox.vue'

interface Props {
  noteId: string
  canvasData: string
  tool: ToolType
  strokeColor: string
  strokeWidth: number
  textBoxes: TextBox[]
  imageBoxes: ImageBox[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'canvasChange', dataUrl: string): void
  (e: 'addTextBox', x: number, y: number): void
  (e: 'updateTextBox', textBoxId: string, updates: Partial<TextBox>): void
  (e: 'updateTextBoxStyle', textBoxId: string, style: Partial<TextBoxStyle>): void
  (e: 'deleteTextBox', textBoxId: string): void
  (e: 'setActiveTextBox', textBoxId: string | null): void
  (e: 'updateImageBox', imageBoxId: string, updates: Partial<ImageBox>): void
  (e: 'updateImageBoxStyle', imageBoxId: string, style: Partial<ImageBoxStyle>): void
  (e: 'deleteImageBox', imageBoxId: string): void
  (e: 'setActiveImageBox', imageBoxId: string | null): void
  (e: 'bringImageBoxToFront', imageBoxId: string): void
  (e: 'sendImageBoxToBack', imageBoxId: string): void
}>()

const noteStore = useNoteStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

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

function getRelativePoint(e: MouseEvent | TouchEvent): { x: number; y: number } | null {
  if (!containerRef.value) return null
  const rect = containerRef.value.getBoundingClientRect()
  let clientX: number, clientY: number
  if ('touches' in e) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

function handleCanvasMouseDown(e: MouseEvent) {
  if (noteStore.activeNoteId !== props.noteId) {
    noteStore.setActiveNote(props.noteId)
  }
  if (props.tool === 'text') {
    e.preventDefault()
    const point = getRelativePoint(e)
    if (point) {
      emit('addTextBox', point.x - 90, point.y - 20)
    }
  }
}

function handleCanvasTouchStart(e: TouchEvent) {
  if (noteStore.activeNoteId !== props.noteId) {
    noteStore.setActiveNote(props.noteId)
  }
  if (props.tool === 'text') {
    e.preventDefault()
    const point = getRelativePoint(e)
    if (point) {
      emit('addTextBox', point.x - 90, point.y - 20)
    }
  }
}

function handleContainerClick() {
  if (props.tool !== 'text') {
    emit('setActiveTextBox', null)
  }
  emit('setActiveImageBox', null)
}

function handleTextBoxActivate(textBoxId: string) {
  emit('setActiveTextBox', textBoxId)
}

function handleTextBoxDelete(textBoxId: string) {
  emit('deleteTextBox', textBoxId)
}

function handleTextBoxUpdateX(textBoxId: string, x: number) {
  emit('updateTextBox', textBoxId, { x })
}

function handleTextBoxUpdateY(textBoxId: string, y: number) {
  emit('updateTextBox', textBoxId, { y })
}

function handleTextBoxUpdateWidth(textBoxId: string, width: number) {
  emit('updateTextBox', textBoxId, { width })
}

function handleTextBoxUpdateHeight(textBoxId: string, height: number) {
  emit('updateTextBox', textBoxId, { height })
}

function handleTextBoxUpdateContent(textBoxId: string, content: string) {
  emit('updateTextBox', textBoxId, { content })
}

function handleTextBoxUpdateStyle(textBoxId: string, style: Partial<TextBoxStyle>) {
  emit('updateTextBoxStyle', textBoxId, style)
}

function handleImageBoxActivate(imageBoxId: string) {
  emit('setActiveImageBox', imageBoxId)
}

function handleImageBoxDelete(imageBoxId: string) {
  emit('deleteImageBox', imageBoxId)
}

function handleImageBoxUpdateX(imageBoxId: string, x: number) {
  emit('updateImageBox', imageBoxId, { x })
}

function handleImageBoxUpdateY(imageBoxId: string, y: number) {
  emit('updateImageBox', imageBoxId, { y })
}

function handleImageBoxUpdateWidth(imageBoxId: string, width: number) {
  emit('updateImageBox', imageBoxId, { width })
}

function handleImageBoxUpdateHeight(imageBoxId: string, height: number) {
  emit('updateImageBox', imageBoxId, { height })
}

function handleImageBoxUpdateStyle(imageBoxId: string, style: Partial<ImageBoxStyle>) {
  emit('updateImageBoxStyle', imageBoxId, style)
}

function handleImageBoxBringToFront(imageBoxId: string) {
  emit('bringImageBoxToFront', imageBoxId)
}

function handleImageBoxSendToBack(imageBoxId: string) {
  emit('sendImageBoxToBack', imageBoxId)
}

const sortedImageBoxes = computed(() => {
  return [...props.imageBoxes].sort((a, b) => a.zIndex - b.zIndex)
})

defineExpose({
  canvasRef,
  clear,
  initCanvas
})
</script>

<template>
  <div
    ref="containerRef"
    class="absolute inset-0 w-full h-full"
    @click="handleContainerClick"
  >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full cursor-crosshair"
      :class="{
        'cursor-pen': tool === 'pen',
        'cursor-erase': tool === 'eraser',
        'cursor-crosshair': tool === 'line' || tool === 'rect' || tool === 'circle',
        'cursor-text': tool === 'text'
      }"
      @mousedown.stop="handleCanvasMouseDown"
      @touchstart.stop="handleCanvasTouchStart"
      @click.stop
    ></canvas>

    <ImageBoxComp
      v-for="img in sortedImageBoxes"
      :key="img.id"
      :note-id="noteId"
      :image-box="img"
      @update:x="handleImageBoxUpdateX(img.id, $event)"
      @update:y="handleImageBoxUpdateY(img.id, $event)"
      @update:width="handleImageBoxUpdateWidth(img.id, $event)"
      @update:height="handleImageBoxUpdateHeight(img.id, $event)"
      @update:style="handleImageBoxUpdateStyle(img.id, $event)"
      @activate="handleImageBoxActivate(img.id)"
      @delete="handleImageBoxDelete(img.id)"
      @bringToFront="handleImageBoxBringToFront(img.id)"
      @sendToBack="handleImageBoxSendToBack(img.id)"
    />

    <TextBoxComp
      v-for="tb in textBoxes"
      :key="tb.id"
      :note-id="noteId"
      :text-box="tb"
      @update:x="handleTextBoxUpdateX(tb.id, $event)"
      @update:y="handleTextBoxUpdateY(tb.id, $event)"
      @update:width="handleTextBoxUpdateWidth(tb.id, $event)"
      @update:height="handleTextBoxUpdateHeight(tb.id, $event)"
      @update:content="handleTextBoxUpdateContent(tb.id, $event)"
      @update:style="handleTextBoxUpdateStyle(tb.id, $event)"
      @activate="handleTextBoxActivate(tb.id)"
      @delete="handleTextBoxDelete(tb.id)"
    />
  </div>
</template>

<style scoped>
.cursor-pen {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2'%3E%3Cpath d='M12 19l7-7 3 3-7 7-3-3z'/%3E%3Cpath d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z'/%3E%3Cpath d='M2 2l7.586 7.586'/%3E%3Ccircle cx='11' cy='11' r='2'/%3E%3C/svg%3E") 0 24, crosshair;
}
.cursor-erase {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2'%3E%3Cpath d='M20 20H7L3 16l13-13 4 4z'/%3E%3Cpath d='M18 18l-3-3'/%3E%3C/svg%3E") 12 12, crosshair;
}
.cursor-text {
  cursor: text;
}
</style>
