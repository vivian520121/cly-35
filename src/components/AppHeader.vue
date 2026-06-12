<script setup lang="ts">
import { Plus, Trash2, HelpCircle, StickyNote, Eye, EyeOff } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/noteStore'
import { NOTE_TAG_OPTIONS } from '@/types'

const noteStore = useNoteStore()

function handleNewNote() {
  noteStore.createNote()
}

function handleClearAll() {
  if (noteStore.notes.length === 0) return
  const confirmed = confirm('确定要删除所有便签吗？此操作不可撤销。')
  if (confirmed === true) {
    noteStore.clearAllNotes()
  }
}

function handleHelp() {
  alert(
    '桌面涂鸦便签使用说明：\n\n' +
    '【快捷键】\n' +
    '• Ctrl+N：新建便签\n' +
    '• Ctrl+S：保存到本地\n' +
    '• Ctrl+Z：撤销操作\n' +
    '• P：切换画笔工具\n' +
    '• E：切换橡皮擦工具\n' +
    '• T：打开/关闭文本编辑器\n\n' +
    '【基础操作】\n' +
    '• 点击「新建便签」创建新便签\n' +
    '• 拖拽便签顶部标题栏可移动位置\n' +
    '• 点击便签可选中并置顶\n' +
    '• 使用便签底部工具栏切换绘图工具\n' +
    '• 支持画笔、橡皮、线条、矩形、圆形工具\n' +
    '• 点击 T 图标可展开文本编辑器\n' +
    '• 点击调色板图标可设置便签样式\n' +
    '• 在便签标题栏点击标签图标可设置分组标签\n' +
    '• 在顶部标签栏点击标签可隐藏/显示对应分组的便签\n' +
    '• 数据自动保存到本地，刷新不丢失\n' +
    '• 点击导出按钮可将便签保存为 PNG 图片'
  )
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
    <div class="h-14 px-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center shadow-sm">
          <StickyNote class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-lg font-semibold text-gray-800">桌面涂鸦便签</h1>
        <span class="text-xs text-gray-400 ml-2">Canvas + Vue3</span>
      </div>

      <div class="flex items-center gap-3">
        <div v-if="noteStore.notes.length > 0" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400 mr-1">标签筛选</span>
          <button
            v-for="option in NOTE_TAG_OPTIONS"
            :key="option.value"
            @click="noteStore.toggleTagFilter(option.value)"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 border"
            :class="noteStore.isTagHidden(option.value)
              ? 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60'
              : 'border-transparent hover:opacity-80'"
            :style="!noteStore.isTagHidden(option.value) ? { color: option.color, backgroundColor: option.bgColor } : {}"
          >
            <EyeOff v-if="noteStore.isTagHidden(option.value)" class="w-3 h-3" />
            <Eye v-else class="w-3 h-3" />
            {{ option.label }}
          </button>
        </div>

        <div class="w-px h-6 bg-gray-200 mx-2" v-if="noteStore.notes.length > 0"></div>

        <button
          @click="handleNewNote"
          class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <Plus class="w-5 h-5" />
          <span>新建便签</span>
        </button>

        <div class="w-px h-6 bg-gray-200 mx-2"></div>

        <button
          @click="handleClearAll"
          :disabled="noteStore.notes.length === 0"
          class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
        >
          <Trash2 class="w-4 h-4" />
          <span class="text-sm">清空</span>
        </button>

        <button
          @click="handleHelp"
          class="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
        >
          <HelpCircle class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>
