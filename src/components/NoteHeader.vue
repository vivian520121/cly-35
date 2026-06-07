<script setup lang="ts">
import { ref } from 'vue'
import { Pin, ChevronUp, ChevronDown, Download, Trash2 } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/noteStore'
import { useNoteDrag } from '@/composables/useNoteDrag'
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

const { isDragging } = useNoteDrag({
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

defineExpose({
  noteRef
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
    </div>

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
