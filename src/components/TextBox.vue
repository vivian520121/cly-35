<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Trash2, Bold, ChevronDown } from 'lucide-vue-next'
import type { TextBox, TextBoxStyle } from '@/types'
import { STROKE_COLORS } from '@/types'

interface Props {
  noteId: string
  textBox: TextBox
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:x', x: number): void
  (e: 'update:y', y: number): void
  (e: 'update:width', width: number): void
  (e: 'update:height', height: number): void
  (e: 'update:content', content: string): void
  (e: 'update:style', style: Partial<TextBoxStyle>): void
  (e: 'activate'): void
  (e: 'delete'): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showColorPicker = ref(false)
const showFontSizePicker = ref(false)
const colorPickerRef = ref<HTMLDivElement | null>(null)
const fontSizePickerRef = ref<HTMLDivElement | null>(null)

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const startX = ref(0)
const startY = ref(0)

const isResizing = ref(false)
const resizeStartX = ref(0)
const resizeStartY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32]

const localContent = ref(props.textBox.content)

watch(
  () => props.textBox.content,
  (val) => {
    localContent.value = val
  }
)

watch(
  () => props.textBox.isEditing,
  (editing) => {
    if (editing) {
      nextTick(() => {
        textareaRef.value?.focus()
        textareaRef.value?.select()
      })
    }
  }
)

function handleContentChange(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:content', target.value)
  autoResize()
}

function autoResize() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      const newHeight = Math.max(textareaRef.value.scrollHeight, 30)
      emit('update:height', newHeight + 16)
    }
  })
}

function handleMouseDownHeader(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('activate')
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  startX.value = props.textBox.x
  startY.value = props.textBox.y
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    const dx = e.clientX - dragStartX.value
    const dy = e.clientY - dragStartY.value
    emit('update:x', startX.value + dx)
    emit('update:y', startY.value + dy)
  }
  if (isResizing.value) {
    const dx = e.clientX - resizeStartX.value
    const dy = e.clientY - resizeStartY.value
    emit('update:width', Math.max(100, startWidth.value + dx))
    emit('update:height', Math.max(40, startHeight.value + dy))
  }
}

function handleMouseUp() {
  isDragging.value = false
  isResizing.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleResizeMouseDown(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  resizeStartX.value = e.clientX
  resizeStartY.value = e.clientY
  startWidth.value = props.textBox.width
  startHeight.value = props.textBox.height
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleTextBoxClick(e: MouseEvent) {
  e.stopPropagation()
  emit('activate')
}

function handleDoubleClick(e: MouseEvent) {
  e.stopPropagation()
  emit('activate')
}

function selectColor(color: string) {
  emit('update:style', { color })
  showColorPicker.value = false
}

function selectFontSize(size: number) {
  emit('update:style', { fontSize: size })
  showFontSizePicker.value = false
}

function toggleBold() {
  emit('update:style', { bold: !props.textBox.style.bold })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    textareaRef.value?.blur()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (colorPickerRef.value && !colorPickerRef.value.contains(e.target as Node)) {
    showColorPicker.value = false
  }
  if (fontSizePickerRef.value && !fontSizePickerRef.value.contains(e.target as Node)) {
    showFontSizePicker.value = false
  }
}

function toggleColorPicker(e: MouseEvent) {
  e.stopPropagation()
  showFontSizePicker.value = false
  showColorPicker.value = !showColorPicker.value
}

function toggleFontSizePicker(e: MouseEvent) {
  e.stopPropagation()
  showColorPicker.value = false
  showFontSizePicker.value = !showFontSizePicker.value
}

function handleToolbarButtonMouseDown(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  nextTick(() => {
    autoResize()
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

const textStyle = computed(() => ({
  color: props.textBox.style.color,
  fontSize: `${props.textBox.style.fontSize}px`,
  fontWeight: props.textBox.style.bold ? 700 : 400
}))
</script>

<template>
  <div
    class="text-box absolute select-none"
    :class="[
      textBox.isActive ? 'ring-2 ring-blue-400/60 shadow-lg' : 'ring-1 ring-black/10 shadow-sm',
      isDragging ? 'opacity-80' : ''
    ]"
    :style="{
      left: `${textBox.x}px`,
      top: `${textBox.y}px`,
      width: `${textBox.width}px`,
      minHeight: `${textBox.height}px`,
      zIndex: textBox.isActive ? 100 : 50
    }"
    @mousedown="handleTextBoxClick"
    @dblclick="handleDoubleClick"
    @click.stop
  >
    <div
      v-if="textBox.isActive"
      class="text-box-header absolute -top-8 left-0 right-0 h-7 flex items-center justify-between bg-blue-500/95 rounded-t-md px-1.5 cursor-move shadow-md"
      @mousedown="handleMouseDownHeader"
    >
      <div class="flex items-center gap-1">
        <div class="relative" ref="colorPickerRef">
          <button
            @mousedown="handleToolbarButtonMouseDown"
            @click="toggleColorPicker"
            class="w-5 h-5 rounded-full border-2 border-white/80 hover:scale-110 transition-transform flex-shrink-0"
            :style="{ backgroundColor: textBox.style.color }"
            title="文字颜色"
          ></button>
          <div
            v-if="showColorPicker"
            class="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-2xl border border-gray-200 grid grid-cols-4 gap-1.5 z-[1000] min-w-[130px]"
            @click.stop
            @mousedown.stop
          >
            <button
              v-for="c in STROKE_COLORS"
              :key="c"
              @mousedown.stop
              @click="selectColor(c)"
              class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              :class="textBox.style.color === c ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-200'"
              :style="{ backgroundColor: c }"
            ></button>
          </div>
        </div>

        <div class="w-px h-4 bg-white/40 mx-0.5 flex-shrink-0"></div>

        <button
          @mousedown="handleToolbarButtonMouseDown"
          @click.stop="toggleBold"
          class="p-0.5 rounded transition-colors flex-shrink-0"
          :class="textBox.style.bold ? 'bg-white/30 text-white' : 'text-white/80 hover:bg-white/20 hover:text-white'"
          title="加粗"
        >
          <Bold class="w-4 h-4" />
        </button>

        <div class="w-px h-4 bg-white/40 mx-0.5 flex-shrink-0"></div>

        <div class="relative" ref="fontSizePickerRef">
          <button
            @mousedown="handleToolbarButtonMouseDown"
            @click="toggleFontSizePicker"
            class="h-5 px-1.5 text-xs bg-white/20 text-white rounded flex items-center gap-0.5 hover:bg-white/30 transition-colors flex-shrink-0"
            title="字体大小"
          >
            <span class="font-medium">{{ textBox.style.fontSize }}</span>
            <ChevronDown class="w-3 h-3" />
          </button>
          <div
            v-if="showFontSizePicker"
            class="absolute bottom-full left-0 mb-2 p-1.5 bg-white rounded-lg shadow-2xl border border-gray-200 grid grid-cols-4 gap-1 z-[1000] min-w-[140px]"
            @click.stop
            @mousedown.stop
          >
            <button
              v-for="size in fontSizes"
              :key="size"
              @mousedown.stop
              @click="selectFontSize(size)"
              class="px-1.5 py-1 text-xs rounded transition-colors"
              :class="textBox.style.fontSize === size 
                ? 'bg-blue-500 text-white font-medium shadow-sm' 
                : 'text-gray-700 hover:bg-gray-100'"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </div>

      <button
        @mousedown="handleToolbarButtonMouseDown"
        @click.stop="emit('delete')"
        class="p-0.5 rounded text-white/80 hover:bg-red-500/80 hover:text-white transition-colors flex-shrink-0"
        title="删除"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <div class="w-full h-full bg-white/95 rounded-md p-2 overflow-hidden">
      <textarea
        ref="textareaRef"
        :value="localContent"
        @input="handleContentChange"
        @keydown="handleKeyDown"
        @click.stop
        class="w-full h-full min-h-[24px] bg-transparent border-0 outline-none resize-none leading-relaxed placeholder-gray-400"
        :style="textStyle"
        :placeholder="textBox.isEditing ? '输入文字...' : ''"
        :readonly="!textBox.isEditing"
      ></textarea>
    </div>

    <div
      v-if="textBox.isActive"
      class="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="handleResizeMouseDown"
    ></div>
  </div>
</template>

<style scoped>
.text-box {
  transition: box-shadow 0.15s ease;
}
</style>
