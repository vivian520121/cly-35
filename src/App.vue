<script setup lang="ts">
import { useNoteStore } from '@/stores/noteStore'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import AppHeader from '@/components/AppHeader.vue'
import StickyNote from '@/components/StickyNote.vue'

useLocalStorage()
useKeyboardShortcuts()

const noteStore = useNoteStore()

function handleDesktopClick() {
  noteStore.setActiveNote(null)
}
</script>

<template>
  <div
    class="min-h-screen w-full relative overflow-hidden"
    @click="handleDesktopClick"
  >
    <div class="fixed inset-0 desktop-bg"></div>

    <AppHeader />

    <main class="pt-14 relative z-10 min-h-screen">
      <TransitionGroup name="note-list">
        <StickyNote
          v-for="note in noteStore.filteredSortedNotes"
          :key="note.id"
          :note="note"
        />
      </TransitionGroup>

      <div
        v-if="noteStore.notes.length === 0"
        class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <div class="text-center">
          <div class="text-6xl mb-4 opacity-50">📝</div>
          <h2 class="text-xl font-medium text-gray-500 mb-2">还没有便签</h2>
          <p class="text-gray-400 text-sm">点击顶部「新建便签」开始使用</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.desktop-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 50%, #f0f2f5 100%);
  background-attachment: fixed;
}

.desktop-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.5;
}

.note-list-enter-active,
.note-list-leave-active {
  transition: all 0.3s ease;
}

.note-list-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.note-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.note-list-move {
  transition: transform 0.3s ease;
}
</style>
