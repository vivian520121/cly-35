<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Eraser, Minus, Square, Circle, Type, Palette, RotateCcw } from 'lucide-vue-next'
import type { ToolType } from '@/types'
import { STROKE_COLORS } from '@/types'

interface Props {
  currentTool: ToolType
  strokeColor: string
  strokeWidth: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentTool', tool: ToolType): void
  (e: 'update:strokeColor', color: string): void
  (e: 'update:strokeWidth', width: number): void
  (e: 'clear'): void
  (e: 'toggleText'): void
  (e: 'toggleStyle'): void
}>()

const showColorPicker = ref(false)
const strokeWidths = [1, 2, 3, 5, 8]

const tools = [
  { type: 'pen' as ToolType, icon: Pencil, label: '画笔' },
  { type: 'eraser' as ToolType, icon: Eraser, label: '橡皮' },
  { type: 'line' as ToolType, icon: Minus, label: '线条' },
  { type: 'rect' as ToolType, icon: Square, label: '矩形' },
  { type: 'circle' as ToolType, icon: Circle, label: '圆形' }
]

function selectTool(tool: ToolType) {
  emit('update:currentTool', tool)
}

function selectColor(color: string) {
  emit('update:strokeColor', color)
  showColorPicker.value = false
}

function selectWidth(width: number) {
  emit('update:strokeWidth', width)
}
</script>

<template>
  <div class="h-12 px-3 flex items-center justify-between border-t border-black/10 bg-black/3">
    <div class="flex items-center gap-0.5">
      <button
        v-for="tool in tools"
        :key="tool.type"
        @click="selectTool(tool.type)"
        class="p-1.5 rounded transition-all duration-150"
        :class="[
          currentTool === tool.type
            ? 'bg-black/15 text-gray-900 shadow-sm'
            : 'text-gray-600 hover:bg-black/8 hover:text-gray-900'
        ]"
        :title="tool.label"
      >
        <component :is="tool.icon" class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-black/10 mx-1"></div>

      <div class="relative">
        <button
          @click="showColorPicker = !showColorPicker"
          class="p-1.5 rounded hover:bg-black/8 transition-colors flex items-center gap-1"
          title="选择颜色"
        >
          <div
            class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            :style="{ backgroundColor: strokeColor }"
          ></div>
        </button>
        <div
          v-if="showColorPicker"
          class="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 grid grid-cols-4 gap-1 z-10"
        >
          <button
            v-for="color in STROKE_COLORS"
            :key="color"
            @click="selectColor(color)"
            class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            :class="strokeColor === color ? 'border-gray-800 scale-110' : 'border-white'"
            :style="{ backgroundColor: color }"
          ></button>
        </div>
      </div>

      <div class="flex items-center gap-0.5 ml-1">
        <button
          v-for="width in strokeWidths"
          :key="width"
          @click="selectWidth(width)"
          class="w-6 h-6 rounded flex items-center justify-center hover:bg-black/8 transition-colors"
          :class="strokeWidth === width ? 'bg-black/15' : ''"
          title="画笔粗细"
        >
          <div
            class="rounded-full bg-gray-700"
            :style="{
              width: `${Math.min(width + 2, 10)}px`,
              height: `${Math.min(width + 2, 10)}px`
            }"
          ></div>
        </button>
      </div>

      <div class="w-px h-5 bg-black/10 mx-1"></div>

      <button
        @click="emit('clear')"
        class="p-1.5 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="清除画布"
      >
        <RotateCcw class="w-4 h-4" />
      </button>
    </div>

    <div class="flex items-center gap-0.5">
      <button
        @click="emit('toggleText')"
        class="p-1.5 rounded text-gray-600 hover:bg-black/8 hover:text-gray-900 transition-colors"
        title="文本编辑"
      >
        <Type class="w-4 h-4" />
      </button>
      <button
        @click="emit('toggleStyle')"
        class="p-1.5 rounded text-gray-600 hover:bg-black/8 hover:text-gray-900 transition-colors"
        title="便签样式"
      >
        <Palette class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
