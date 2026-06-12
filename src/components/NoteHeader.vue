<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Pin, ChevronUp, ChevronDown, Download, Trash2, Minimize2, Tag } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/noteStore'
import { useNoteDrag } from '@/composables/useNoteDrag'
import { NOTE_TAG_OPTIONS } from '@/types'
import type { NoteTag } from '@/types'
import type { Ref } from 'vue'

interface Props {
  noteId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'export'): void
}>()

const noteStore = useNoteStore()
const handleRef = ref<HTMLElement | null>(null)
const noteRef = ref<HTMLElement | null>(null)
const showTagMenu = ref(false)
const tagMenuRef = ref<HTMLDivElement | null>(null)

const note = noteStore.notes.find(n => n.id === props.noteId)

const currentTagOption = NOTE_TAG_OPTIONS.find(t => t.value === note?.tag)

const { isDragging, isSnapped } = useNoteDrag({
  noteId: props.noteId,
  handleRef: handleRef as Ref<HTMLElement | null>,
  noteRef: noteRef as Ref<HTMLElement | null>
})

function handleTop() {
  noteStore.bringToFront(props.noteId)
}

function handleBottom() {
  noteStore.sendToBack(props.noteId)
}

function handleDelete() {
  if (confirm('确定要删除这张便签吗？')) {
    noteStore.deleteNote(props.noteId)
  }
}

function handleExport() {
  emit('export')
}

function handleMinimize() {
  noteStore.toggleMinimize(props.noteId)
}

function selectTag(tag: NoteTag) {
  noteStore.setNoteTag(props.noteId, tag)
  showTagMenu.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (tagMenuRef.value && !tagMenuRef.value.contains(e.target as Node)) {
    showTagMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  noteRef,
  isDragging,
  isSnapped
})
</script>

<template>
  <div
    ref="handleRef"
    class="note-header h-9 px-3 flex items-center justify-between cursor-move select-none group"
    :class="{ 'cursor-grabbing': isDragging }"
  >
    <div class="flex items-center gap-1.5">
      <Pin class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-500 transition-colors" />
      <div class="flex gap-1.5">
        <div class="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" @click.stop="handleDelete"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" @click.stop="handleBottom"></div>
        <div class="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer" @click.stop="handleTop"></div>
      </div>

      <div class="relative ml-1" ref="tagMenuRef">
        <button
          v-if="currentTagOption"
          @click.stop="showTagMenu = !showTagMenu"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-opacity hover:opacity-80"
          :style="{ color: currentTagOption.color, backgroundColor: currentTagOption.bgColor }"
        >
          {{ currentTagOption.label }}
        </button>
        <button
          v-else
          @click.stop="showTagMenu = !showTagMenu"
          class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all"
          title="添加标签"
        >
          <Tag class="w-3.5 h-3.5 text-gray-500" />
        </button>
        <div
          v-if="showTagMenu"
          class="absolute top-full left-0 mt-1 p-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[100px]"
          @click.stop
        >
          <button
            v-for="option in NOTE_TAG_OPTIONS"
            :key="option.value"
            @click="selectTag(option.value)"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
            :class="{ 'bg-gray-50': note?.tag === option.value }"
          >
            <span
              class="w-2 h-2 rounded-full flex-shrink-0"
              :style="{ backgroundColor: option.color }"
            ></span>
            <span :style="{ color: option.color }">{{ option.label }}</span>
            <span v-if="note?.tag === option.value" class="ml-auto text-gray-400">✓</span>
          </button>
          <div v-if="note?.tag" class="border-t border-gray-100 mt-1 pt-1">
            <button
              @click="selectTag('')"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              移除标签
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        @click.stop="handleMinimize"
        class="p-1.5 hover:bg-black/10 rounded transition-colors"
        title="最小化"
      >
        <Minimize2 class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click.stop="handleTop"
        class="p-1.5 hover:bg-black/10 rounded transition-colors"
        title="置顶"
      >
        <ChevronUp class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click.stop="handleBottom"
        class="p-1.5 hover:bg-black/10 rounded transition-colors"
        title="置底"
      >
        <ChevronDown class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click.stop="handleExport"
        class="p-1.5 hover:bg-black/10 rounded transition-colors"
        title="导出为图片"
      >
        <Download class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click.stop="handleDelete"
        class="p-1.5 hover:bg-red-100 rounded transition-colors"
        title="删除便签"
      >
        <Trash2 class="w-4 h-4 text-gray-600 hover:text-red-500" />
      </button>
    </div>
  </div>
</template>
