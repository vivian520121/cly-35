<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useNoteStore } from '@/stores/noteStore'
import type { Note, NoteStyle } from '@/types'
import { exportNoteAsPNG } from '@/utils/export'
import NoteHeader from './NoteHeader.vue'
import NoteCanvas from './NoteCanvas.vue'
import NoteToolbar from './NoteToolbar.vue'
import NoteTextEditor from './NoteTextEditor.vue'
import NoteStylePanel from './NoteStylePanel.vue'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const noteStore = useNoteStore()
const noteHeaderRef = ref<InstanceType<typeof NoteHeader> | null>(null)
const noteCanvasRef = ref<InstanceType<typeof NoteCanvas> | null>(null)

const showTextEditor = ref(false)
const showStylePanel = ref(false)
const isAppearing = ref(true)
const isDisappearing = ref(false)

const noteStyle = computed(() => props.note.style)
const drawing = computed(() => props.note.drawing)
const text = computed(() => props.note.text)

const borderClass = computed(() => {
  const style = props.note.style
  if (style.borderStyle === 'none') return ''
  const borderMap = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  }
  return `border ${borderMap[style.borderStyle]}`
})

function handleCanvasChange(dataUrl: string) {
  noteStore.updateNoteCanvasData(props.note.id, dataUrl)
}

function handleToolUpdate(tool: typeof drawing.value.currentTool) {
  noteStore.updateNoteDrawing(props.note.id, { currentTool: tool })
}

function handleColorUpdate(color: string) {
  noteStore.updateNoteDrawing(props.note.id, { strokeColor: color })
}

function handleWidthUpdate(width: number) {
  noteStore.updateNoteDrawing(props.note.id, { strokeWidth: width })
}

function handleClear() {
  const confirmed = confirm('确定要清除画布内容吗？')
  if (confirmed === true) {
    noteCanvasRef.value?.clear()
  }
}

function handleTextContentUpdate(content: string) {
  noteStore.updateNoteText(props.note.id, { content })
}

function handleTextColorUpdate(color: string) {
  noteStore.updateNoteText(props.note.id, { color })
}

function handleFontSizeUpdate(fontSize: number) {
  noteStore.updateNoteText(props.note.id, { fontSize })
}

function handleStyleUpdate(style: Partial<NoteStyle>) {
  noteStore.updateNoteStyle(props.note.id, style)
}

async function handleExport() {
  try {
    const canvasDataUrl = props.note.canvasData
    await exportNoteAsPNG(props.note, canvasDataUrl)
  } catch (e) {
    console.error('导出失败:', e)
    alert('导出失败，请重试')
  }
}

function handleNoteClick() {
  if (!props.note.isActive) {
    noteStore.setActiveNote(props.note.id)
  }
}

watch(
  () => props.note.isActive,
  (active) => {
    if (active) {
      nextTick(() => {
        noteCanvasRef.value?.initCanvas()
      })
    }
  }
)

onMounted(() => {
  setTimeout(() => {
    isAppearing.value = false
  }, 300)
})
</script>

<template>
  <div
    class="sticky-note absolute flex flex-col rounded-lg shadow-note overflow-hidden animate-note-appear"
    :class="[
      note.isActive ? 'shadow-note-active ring-2 ring-blue-400/30' : '',
      borderClass,
      { 'animate-note-disappear': isDisappearing }
    ]"
    :style="{
      left: `${note.x}px`,
      top: `${note.y}px`,
      width: `${note.width}px`,
      height: `${note.height}px`,
      zIndex: note.zIndex,
      backgroundColor: note.style.backgroundColor,
      opacity: note.style.opacity,
      borderColor: note.style.borderColor,
      borderWidth: note.style.borderStyle !== 'none' ? `${note.style.borderWidth}px` : '0px'
    }"
    @mousedown="handleNoteClick"
    @touchstart="handleNoteClick"
  >
    <NoteHeader
      ref="noteHeaderRef"
      :note-id="note.id"
      @export="handleExport"
    />

    <div class="flex-1 flex flex-col min-h-0">
      <div class="flex-1 relative overflow-hidden">
        <NoteCanvas
          ref="noteCanvasRef"
          :note-id="note.id"
          :canvas-data="note.canvasData"
          :tool="drawing.currentTool"
          :stroke-color="drawing.strokeColor"
          :stroke-width="drawing.strokeWidth"
          @canvas-change="handleCanvasChange"
        />
      </div>

      <NoteTextEditor
        :content="text.content"
        :color="text.color"
        :font-size="text.fontSize"
        :visible="showTextEditor"
        @update:content="handleTextContentUpdate"
        @update:color="handleTextColorUpdate"
        @update:font-size="handleFontSizeUpdate"
        @close="showTextEditor = false"
      />

      <div class="shrink-0">
        <NoteToolbar
          :current-tool="drawing.currentTool"
          :stroke-color="drawing.strokeColor"
          :stroke-width="drawing.strokeWidth"
          @update:current-tool="handleToolUpdate"
          @update:stroke-color="handleColorUpdate"
          @update:stroke-width="handleWidthUpdate"
          @clear="handleClear"
          @toggle-text="showTextEditor = !showTextEditor"
          @toggle-style="showStylePanel = !showStylePanel"
        />
      </div>
    </div>

    <NoteStylePanel
      :style="noteStyle"
      :visible="showStylePanel"
      @update:style="handleStyleUpdate"
      @close="showStylePanel = false"
    />
  </div>
</template>

<style scoped>
.sticky-note {
  transition: box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
  will-change: left, top, z-index;
}

.sticky-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}
</style>
