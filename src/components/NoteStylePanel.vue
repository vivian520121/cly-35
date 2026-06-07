<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import type { NoteStyle } from '@/types'
import { NOTE_COLORS, BORDER_STYLES } from '@/types'

interface Props {
  style: NoteStyle
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:style', style: Partial<NoteStyle>): void
  (e: 'close'): void
}>()

const opacityValues = [1, 0.95, 0.9, 0.8, 0.7, 0.6]

function updateStyle(updates: Partial<NoteStyle>) {
  emit('update:style', updates)
}

function selectBackgroundColor(color: string) {
  updateStyle({ backgroundColor: color })
}

function selectOpacity(opacity: number) {
  updateStyle({ opacity })
}

function selectBorderStyle(borderStyle: NoteStyle['borderStyle']) {
  updateStyle({ borderStyle })
}

function selectBorderColor(borderColor: string) {
  updateStyle({ borderColor })
}

function selectBorderWidth(borderWidth: number) {
  updateStyle({ borderWidth })
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="absolute top-0 right-0 bottom-0 left-0 z-20 bg-black/20 backdrop-blur-sm flex items-start justify-end p-4"
      @click.self="emit('close')"
    >
      <div
        class="w-64 bg-white rounded-xl shadow-2xl p-4 animate-in slide-in-from-right"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-gray-800">便签样式</h3>
        <button
          @click="emit('close')"
          class="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <X class="w-4 h-4 text-gray-500" />
        </button>
      </div>

        <div class="space-y-4">
          <div>
          <label class="block text-sm text-gray-600 mb-2">背景颜色</label>
          <div class="grid grid-cols-6 gap-1">
            <button
              v-for="color in NOTE_COLORS"
              :key="color"
              @click="selectBackgroundColor(color)"
              class="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
              :class="style.backgroundColor === color ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent'"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>

          <div>
          <label class="block text-sm text-gray-600 mb-2">
            透明度
          </label>
          <div class="flex items-center gap-1">
            <button
              v-for="op in opacityValues"
              :key="op"
              @click="selectOpacity(op)"
              class="flex-1 py-1.5 rounded text-xs transition-all"
              :class="style.opacity === op ? 'bg-blue-500 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              {{ Math.round(op * 100) }}%
            </button>
          </div>
        </div>

          <div>
          <label class="block text-sm text-gray-600 mb-2">边框样式</label>
          <div class="flex items-center gap-1">
            <button
              v-for="bs in BORDER_STYLES"
              :key="bs.value"
              @click="selectBorderStyle(bs.value)"
              class="flex-1 py-1.5 px-2 rounded text-xs transition-all"
              :class="style.borderStyle === bs.value ? 'bg-blue-500 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              {{ bs.label }}
            </button>
          </div>
        </div>

          <div v-if="style.borderStyle !== 'none'">
          <label class="block text-sm text-gray-600 mb-2">边框颜色</label>
          <div class="grid grid-cols-6 gap-1">
            <button
              v-for="color in ['#CCCCCC', '#999999', '#666666', '#333333', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1']"
              :key="color"
              @click="selectBorderColor(color)"
              class="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
              :class="style.borderColor === color ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent'"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>

          <div v-if="style.borderStyle !== 'none'">
          <label class="block text-sm text-gray-600 mb-2">
            边框粗细
          </label>
            <div class="flex items-center gap-1">
              <button
                v-for="width in [1, 2, 3]"
                :key="width"
                @click="selectBorderWidth(width)"
                class="flex-1 py-1.5 rounded text-xs transition-all"
                :class="style.borderWidth === width ? 'bg-blue-500 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                {{ width }}px
              </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-from-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
