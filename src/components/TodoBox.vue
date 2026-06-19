<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Trash2, Plus, Bold, ChevronDown, Check } from 'lucide-vue-next'
import type { TodoBox, TodoBoxStyle, TodoItem } from '@/types'
import { STROKE_COLORS } from '@/types'

interface Props {
  noteId: string
  todoBox: TodoBox
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:x', x: number): void
  (e: 'update:y', y: number): void
  (e: 'update:width', width: number): void
  (e: 'update:height', height: number): void
  (e: 'update:style', style: Partial<TodoBoxStyle>): void
  (e: 'activate'): void
  (e: 'delete'): void
  (e: 'addItem'): void
  (e: 'updateItem', itemId: string, updates: Partial<TodoItem>): void
  (e: 'deleteItem', itemId: string): void
  (e: 'toggleItem', itemId: string): void
}>()

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
const inputRefs = ref<Map<string, HTMLInputElement>>(new Map())

function handleMouseDownHeader(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('activate')
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  startX.value = props.todoBox.x
  startY.value = props.todoBox.y
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
    emit('update:width', Math.max(160, startWidth.value + dx))
    emit('update:height', Math.max(80, startHeight.value + dy))
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
  startWidth.value = props.todoBox.width
  startHeight.value = props.todoBox.height
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleTodoBoxClick(e: MouseEvent) {
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
  emit('update:style', { bold: !props.todoBox.style.bold })
}

function handleItemTextChange(itemId: string, e: Event) {
  const target = e.target as HTMLInputElement
  emit('updateItem', itemId, { text: target.value })
}

function handleItemKeyDown(itemId: string, e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('addItem')
  } else if (e.key === 'Backspace') {
    const item = props.todoBox.items.find(i => i.id === itemId)
    if (item && item.text === '' && props.todoBox.items.length > 1) {
      e.preventDefault()
      emit('deleteItem', itemId)
    }
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

function focusInput(itemId: string, inputEl: HTMLInputElement | null) {
  if (inputEl) {
    inputRefs.value.set(itemId, inputEl)
  }
}

watch(
  () => props.todoBox.items.length,
  () => {
    nextTick(() => {
      const lastItem = props.todoBox.items[props.todoBox.items.length - 1]
      if (lastItem) {
        const input = inputRefs.value.get(lastItem.id)
        if (input) {
          input.focus()
        }
      }
    })
  }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

const textStyle = computed(() => ({
  color: props.todoBox.style.color,
  fontSize: `${props.todoBox.style.fontSize}px`,
  fontWeight: props.todoBox.style.bold ? 700 : 400
}))
</script>

<template>
  <div
    class="todo-box absolute select-none"
    :class="[
      todoBox.isActive ? 'ring-2 ring-emerald-400/60 shadow-lg' : 'ring-1 ring-black/10 shadow-sm',
      isDragging ? 'opacity-80' : ''
    ]"
    :style="{
      left: `${todoBox.x}px`,
      top: `${todoBox.y}px`,
      width: `${todoBox.width}px`,
      minHeight: `${todoBox.height}px`,
      zIndex: todoBox.isActive ? 100 : 50
    }"
    @mousedown="handleTodoBoxClick"
    @click.stop
  >
    <div
      v-if="todoBox.isActive"
      class="todo-box-header absolute -top-8 left-0 right-0 h-7 flex items-center justify-between bg-emerald-500/95 rounded-t-md px-1.5 cursor-move shadow-md"
      @mousedown="handleMouseDownHeader"
    >
      <div class="flex items-center gap-1">
        <div class="relative" ref="colorPickerRef">
          <button
            @mousedown="handleToolbarButtonMouseDown"
            @click="toggleColorPicker"
            class="w-5 h-5 rounded-full border-2 border-white/80 hover:scale-110 transition-transform flex-shrink-0"
            :style="{ backgroundColor: todoBox.style.color }"
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
              :class="todoBox.style.color === c ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-200'"
              :style="{ backgroundColor: c }"
            ></button>
          </div>
        </div>

        <div class="w-px h-4 bg-white/40 mx-0.5 flex-shrink-0"></div>

        <button
          @mousedown="handleToolbarButtonMouseDown"
          @click.stop="toggleBold"
          class="p-0.5 rounded transition-colors flex-shrink-0"
          :class="todoBox.style.bold ? 'bg-white/30 text-white' : 'text-white/80 hover:bg-white/20 hover:text-white'"
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
            <span class="font-medium">{{ todoBox.style.fontSize }}</span>
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
              :class="todoBox.style.fontSize === size 
                ? 'bg-emerald-500 text-white font-medium shadow-sm' 
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

    <div class="w-full h-full bg-white/95 rounded-md p-2 overflow-hidden flex flex-col gap-1">
      <div
        v-for="item in todoBox.items"
        :key="item.id"
        class="todo-item flex items-center gap-2 group"
      >
        <button
          @click.stop="emit('toggleItem', item.id)"
          class="todo-checkbox flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all hover:scale-105"
          :class="item.completed 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'border-gray-300 hover:border-emerald-400 bg-white'"
          title="标记完成"
        >
          <Check v-if="item.completed" class="w-3 h-3" stroke-width="3" />
        </button>
        <input
          :ref="(el) => focusInput(item.id, el as HTMLInputElement | null)"
          type="text"
          :value="item.text"
          @input="handleItemTextChange(item.id, $event)"
          @keydown="handleItemKeyDown(item.id, $event)"
          @click.stop
          class="flex-1 min-w-0 bg-transparent border-0 outline-none leading-relaxed placeholder-gray-400 py-0.5"
          :style="{
            ...textStyle,
            textDecoration: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.5 : 1,
            color: item.completed ? '#9CA3AF' : textStyle.color
          }"
          placeholder="输入待办事项..."
        />
        <button
          v-if="todoBox.items.length > 1"
          @click.stop="emit('deleteItem', item.id)"
          class="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
          title="删除此项"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        @click.stop="emit('addItem')"
        class="mt-1 py-1.5 flex items-center justify-center gap-1 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors text-sm border border-dashed border-gray-200 hover:border-emerald-300"
      >
        <Plus class="w-4 h-4" />
        <span>添加待办</span>
      </button>
    </div>

    <div
      v-if="todoBox.isActive"
      class="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-emerald-500 rounded-full cursor-nwse-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="handleResizeMouseDown"
    ></div>
  </div>
</template>

<style scoped>
.todo-box {
  transition: box-shadow 0.15s ease;
}

.todo-item {
  transition: opacity 0.15s ease;
}

.todo-checkbox {
  transition: all 0.15s ease;
}

input::placeholder {
  transition: opacity 0.15s ease;
}
</style>
