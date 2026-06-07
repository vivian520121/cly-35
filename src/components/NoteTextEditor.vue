<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { STROKE_COLORS } from '@/types'

interface Props {
  content: string
  color: string
  fontSize: number
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:content', content: string): void
  (e: 'update:color', color: string): void
  (e: 'update:fontSize', size: number): void
  (e: 'close'): void
}>()

const showColorPicker = ref(false)
const fontSizes = [12, 14, 16, 18, 20, 24]

const localContent = ref(props.content)

watch(
  () => props.content,
  (val) => {
    localContent.value = val
  }
)

function handleContentChange(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:content', target.value)
}

function selectColor(color: string) {
  emit('update:color', color)
  showColorPicker.value = false
}

function selectSize(size: number) {
  emit('update:fontSize', size)
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="border-t border-black/10 bg-black/3 p-3"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="relative">
            <button
              @click="showColorPicker = !showColorPicker"
              class="p-1.5 rounded hover:bg-black/10 transition-colors flex items-center gap-1"
              title="文字颜色"
            >
              <div
                class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                :style="{ backgroundColor: color }"
              ></div>
            </button>
            <div
              v-if="showColorPicker"
              class="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 grid grid-cols-4 gap-1 z-10"
            >
              <button
                v-for="c in STROKE_COLORS"
                :key="c"
                @click="selectColor(c)"
                class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                :class="color === c ? 'border-gray-800 scale-110' : 'border-white'"
                :style="{ backgroundColor: c }"
              ></button>
            </div>
          </div>

          <div class="flex items-center gap-0.5">
            <button
              v-for="size in fontSizes"
              :key="size"
              @click="selectSize(size)"
              class="px-1.5 py-0.5 rounded text-xs hover:bg-black/10 transition-colors"
              :class="fontSize === size ? 'bg-black/20 font-medium' : ''"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <button
          @click="emit('close')"
          class="p-1 rounded hover:bg-black/10 transition-colors text-gray-500 hover:text-gray-700"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <textarea
        :value="content"
        @input="handleContentChange"
        class="w-full min-h-[80px] max-h-[150px] p-2 bg-white/60 rounded-md border border-black/10 resize-y focus:outline-none focus:ring-2 focus:ring-blue-300/50 text-gray-800 placeholder-gray-400"
        :style="{ fontSize: `${fontSize}px`, color: color }"
        placeholder="在此输入文字..."
      ></textarea>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(10px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  max-height: 250px;
}
</style>
