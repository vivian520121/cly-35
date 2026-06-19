<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Trash2, RotateCw, ChevronUp, ChevronDown, CircleDot } from 'lucide-vue-next'
import type { ImageBox, ImageBoxStyle } from '@/types'

interface Props {
  noteId: string
  imageBox: ImageBox
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:x', x: number): void
  (e: 'update:y', y: number): void
  (e: 'update:width', width: number): void
  (e: 'update:height', height: number): void
  (e: 'update:style', style: Partial<ImageBoxStyle>): void
  (e: 'activate'): void
  (e: 'delete'): void
  (e: 'bringToFront'): void
  (e: 'sendToBack'): void
}>()

const showToolbar = ref(false)
const toolbarRef = ref<HTMLDivElement | null>(null)

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const startX = ref(0)
const startY = ref(0)

const isResizing = ref(false)
const resizeDirection = ref('')
const resizeStartX = ref(0)
const resizeStartY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)
const startLeft = ref(0)
const startTop = ref(0)

const isRotating = ref(false)
const rotateStartAngle = ref(0)
const startRotation = ref(0)
const centerX = ref(0)
const centerY = ref(0)

const imageLoaded = ref(false)

const imageStyle = computed(() => ({
  opacity: props.imageBox.style.opacity,
  transform: `rotate(${props.imageBox.style.rotation}deg)`,
  borderRadius: `${props.imageBox.style.borderRadius}px`,
}))

const containerStyle = computed(() => ({
  left: `${props.imageBox.x}px`,
  top: `${props.imageBox.y}px`,
  width: `${props.imageBox.width}px`,
  height: `${props.imageBox.height}px`,
  zIndex: props.imageBox.isActive ? 100 : props.imageBox.zIndex,
  transform: `rotate(${props.imageBox.style.rotation}deg)`,
  transformOrigin: 'center center',
}))

const frameStyle = computed(() => ({
  borderRadius: `${props.imageBox.style.borderRadius}px`,
}))

function handleMouseDownImage(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('activate')
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  startX.value = props.imageBox.x
  startY.value = props.imageBox.y
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
    handleResizeMove(e)
  }

  if (isRotating.value) {
    handleRotateMove(e)
  }
}

function handleMouseUp() {
  isDragging.value = false
  isResizing.value = false
  isRotating.value = false
  resizeDirection.value = ''
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleResizeMouseDown(e: MouseEvent, direction: string) {
  e.preventDefault()
  e.stopPropagation()
  emit('activate')
  isResizing.value = true
  resizeDirection.value = direction
  resizeStartX.value = e.clientX
  resizeStartY.value = e.clientY
  startWidth.value = props.imageBox.width
  startHeight.value = props.imageBox.height
  startLeft.value = props.imageBox.x
  startTop.value = props.imageBox.y
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleResizeMove(e: MouseEvent) {
  const dx = e.clientX - resizeStartX.value
  const dy = e.clientY - resizeStartY.value
  const direction = resizeDirection.value

  let newWidth = startWidth.value
  let newHeight = startHeight.value
  let newX = startLeft.value
  let newY = startTop.value

  const aspectRatio = startWidth.value / startHeight.value

  if (direction.includes('e')) {
    newWidth = Math.max(50, startWidth.value + dx)
    newHeight = newWidth / aspectRatio
  }
  if (direction.includes('w')) {
    const tempWidth = Math.max(50, startWidth.value - dx)
    const tempHeight = tempWidth / aspectRatio
    newX = startLeft.value + startWidth.value - tempWidth
    newWidth = tempWidth
    newHeight = tempHeight
  }
  if (direction.includes('s') && !direction.includes('e') && !direction.includes('w')) {
    newHeight = Math.max(50, startHeight.value + dy)
    newWidth = newHeight * aspectRatio
  }
  if (direction.includes('n') && !direction.includes('e') && !direction.includes('w')) {
    const tempHeight = Math.max(50, startHeight.value - dy)
    const tempWidth = tempHeight * aspectRatio
    newY = startTop.value + startHeight.value - tempHeight
    newHeight = tempHeight
    newWidth = tempWidth
  }

  if (direction === 'se' || direction === 'sw' || direction === 'ne' || direction === 'nw') {
  }

  emit('update:x', newX)
  emit('update:y', newY)
  emit('update:width', newWidth)
  emit('update:height', newHeight)
}

function handleRotateMouseDown(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('activate')
  isRotating.value = true

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const containerRect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect()
  if (containerRect) {
    centerX.value = containerRect.left + containerRect.width / 2
    centerY.value = containerRect.top + containerRect.height / 2
  }

  startRotation.value = props.imageBox.style.rotation
  rotateStartAngle.value = Math.atan2(e.clientY - centerY.value, e.clientX - centerX.value) * 180 / Math.PI

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleRotateMove(e: MouseEvent) {
  const currentAngle = Math.atan2(e.clientY - centerY.value, e.clientX - centerX.value) * 180 / Math.PI
  const deltaAngle = currentAngle - rotateStartAngle.value
  let newRotation = startRotation.value + deltaAngle
  newRotation = Math.round(newRotation)
  emit('update:style', { rotation: newRotation })
}

function handleImageLoad() {
  imageLoaded.value = true
}

function handleToolbarButtonMouseDown(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
}

function handleOpacityChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:style', { opacity: parseFloat(target.value) })
}

function handleBorderRadiusChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:style', { borderRadius: parseInt(target.value) })
}

function handleClickOutside(e: MouseEvent) {
  if (toolbarRef.value && !toolbarRef.value.contains(e.target as Node)) {
    showToolbar.value = false
  }
}

function toggleToolbar(e: MouseEvent) {
  e.stopPropagation()
  showToolbar.value = !showToolbar.value
}

function handleImageClick(e: MouseEvent) {
  e.stopPropagation()
  emit('activate')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div
    class="image-box absolute select-none"
    :class="[
      imageBox.isActive ? 'ring-2 ring-blue-400/60 shadow-lg' : '',
      isDragging || isResizing ? 'opacity-80' : ''
    ]"
    :style="containerStyle"
    @mousedown="handleImageClick"
    @click.stop
  >
    <div
      v-if="imageBox.isActive"
      class="image-toolbar absolute -top-10 left-1/2 -translate-x-1/2 h-8 flex items-center gap-0.5 bg-blue-500/95 rounded-lg px-1 shadow-lg z-10"
      ref="toolbarRef"
      @mousedown.stop
    >
      <button
        @mousedown="handleToolbarButtonMouseDown"
        @click.stop="toggleToolbar"
        class="p-1 rounded text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        title="更多设置"
      >
        <CircleDot class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-white/40 mx-0.5"></div>

      <button
        @mousedown="handleToolbarButtonMouseDown"
        @click.stop="emit('bringToFront')"
        class="p-1 rounded text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        title="置于顶层"
      >
        <ChevronUp class="w-4 h-4" />
      </button>

      <button
        @mousedown="handleToolbarButtonMouseDown"
        @click.stop="emit('sendToBack')"
        class="p-1 rounded text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        title="置于底层"
      >
        <ChevronDown class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-white/40 mx-0.5"></div>

      <button
        @mousedown="handleToolbarButtonMouseDown"
        @click.stop="emit('delete')"
        class="p-1 rounded text-white/80 hover:bg-red-500/80 hover:text-white transition-colors"
        title="删除"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <div
      v-if="imageBox.isActive && showToolbar"
      class="absolute -top-24 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 z-20 min-w-[180px]"
      @click.stop
      @mousedown.stop
    >
      <div class="space-y-3">
        <div>
          <div class="text-xs text-gray-500 mb-1">透明度</div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            :value="imageBox.style.opacity"
            @input="handleOpacityChange"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div class="text-xs text-gray-400 text-right mt-0.5">{{ Math.round(imageBox.style.opacity * 100) }}%</div>
        </div>

        <div>
          <div class="text-xs text-gray-500 mb-1">圆角</div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            :value="imageBox.style.borderRadius"
            @input="handleBorderRadiusChange"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div class="text-xs text-gray-400 text-right mt-0.5">{{ imageBox.style.borderRadius }}px</div>
        </div>
      </div>
    </div>

    <div
      class="image-frame w-full h-full overflow-hidden bg-white shadow-md"
      :style="frameStyle"
      @mousedown="handleMouseDownImage"
    >
      <img
        :src="imageBox.src"
        alt=""
        class="w-full h-full object-cover pointer-events-none"
        :style="imageStyle"
        @load="handleImageLoad"
        draggable="false"
      />
    </div>

    <div
      v-if="imageBox.isActive"
      class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab border-2 border-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
      @mousedown="handleRotateMouseDown"
      title="旋转"
    >
      <RotateCw class="w-3 h-3 text-white" />
    </div>

    <div
      v-if="imageBox.isActive"
      class="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'nw')"
    ></div>
    <div
      v-if="imageBox.isActive"
      class="absolute -right-1.5 -top-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'ne')"
    ></div>
    <div
      v-if="imageBox.isActive"
      class="absolute -left-1.5 -bottom-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'sw')"
    ></div>
    <div
      v-if="imageBox.isActive"
      class="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'se')"
    ></div>

    <div
      v-if="imageBox.isActive"
      class="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-ns-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'n')"
    ></div>
    <div
      v-if="imageBox.isActive"
      class="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-ns-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 's')"
    ></div>
    <div
      v-if="imageBox.isActive"
      class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-ew-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'w')"
    ></div>
    <div
      v-if="imageBox.isActive"
      class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full cursor-ew-resize border-2 border-white shadow-md hover:scale-125 transition-transform z-10"
      @mousedown="(e) => handleResizeMouseDown(e, 'e')"
    ></div>
  </div>
</template>

<style scoped>
.image-box {
  transition: box-shadow 0.15s ease;
}

.image-frame {
  transition: box-shadow 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
