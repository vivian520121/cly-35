import type { Ref } from 'vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Point, ToolType } from '@/types'
import {
  getCanvasPoint,
  drawLine,
  drawRect,
  drawCircle,
  startEraser,
  stopEraser,
  loadImageToCanvas,
  canvasToDataURL,
  clearCanvas
} from '@/utils/canvas'

interface UseCanvasDrawingOptions {
  canvasRef: Ref<HTMLCanvasElement | null>
  tool: Ref<ToolType>
  strokeColor: Ref<string>
  strokeWidth: Ref<number>
  canvasData: Ref<string>
  onCanvasChange?: (dataUrl: string) => void
}

export function useCanvasDrawing(options: UseCanvasDrawingOptions) {
  const {
    canvasRef,
    tool,
    strokeColor,
    strokeWidth,
    canvasData,
    onCanvasChange
  } = options

  const isDrawing = ref(false)
  const startPoint = ref<Point | null>(null)
  const lastPoint = ref<Point | null>(null)
  const savedImageData = ref<ImageData | null>(null)

  let ctx: CanvasRenderingContext2D | null = null

  function initCanvas() {
    if (!canvasRef.value) return
    ctx = canvasRef.value.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvasRef.value.getBoundingClientRect()
    canvasRef.value.width = rect.width * dpr
    canvasRef.value.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    if (canvasData.value) {
      loadImageToCanvas(canvasRef.value, canvasData.value)
    }
  }

  function saveCanvasState() {
    if (!ctx || !canvasRef.value) return
    savedImageData.value = ctx.getImageData(
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height
    )
  }

  function restoreCanvasState() {
    if (!ctx || !savedImageData.value || !canvasRef.value) return
    ctx.putImageData(savedImageData.value, 0, 0)
  }

  function getPoint(e: MouseEvent | TouchEvent): Point | null {
    if (!canvasRef.value) return null
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    return getCanvasPoint(canvasRef.value, clientX, clientY)
  }

  function handleStart(e: MouseEvent | TouchEvent) {
    e.preventDefault()
    if (!canvasRef.value) return
    isDrawing.value = true
    const point = getPoint(e)
    if (!point) return
    startPoint.value = point
    lastPoint.value = point

    if (tool.value === 'rect' || tool.value === 'circle') {
      saveCanvasState()
    } else if (tool.value === 'eraser') {
      startEraser(ctx!)
      ctx!.lineWidth = strokeWidth.value * 2
    }
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDrawing.value || !ctx || !canvasRef.value) return
    e.preventDefault()
    const point = getPoint(e)
    if (!point || !lastPoint.value) return

    const currentTool = tool.value

    if (currentTool === 'pen') {
      drawLine(ctx, lastPoint.value, point, strokeColor.value, strokeWidth.value)
    } else if (currentTool === 'eraser') {
      drawLine(ctx, lastPoint.value, point, '#000000', strokeWidth.value * 2)
    } else if (currentTool === 'line') {
      restoreCanvasState()
      saveCanvasState()
      drawLine(ctx, startPoint.value!, point, strokeColor.value, strokeWidth.value)
    } else if (currentTool === 'rect') {
      restoreCanvasState()
      drawRect(ctx, startPoint.value!, point, strokeColor.value, strokeWidth.value)
    } else if (currentTool === 'circle') {
      restoreCanvasState()
      drawCircle(ctx, startPoint.value!, point, strokeColor.value, strokeWidth.value)
    }

    lastPoint.value = point
  }

  function handleEnd(e: MouseEvent | TouchEvent) {
    if (!isDrawing.value || !canvasRef.value) return
    e.preventDefault()
    isDrawing.value = false

    if (tool.value === 'eraser') {
      stopEraser(ctx!)
    }

    const dataUrl = canvasToDataURL(canvasRef.value)
    onCanvasChange?.(dataUrl)

    startPoint.value = null
    lastPoint.value = null
    savedImageData.value = null
  }

  function clear() {
    if (ctx && canvasRef.value) {
      clearCanvas(ctx)
      const dataUrl = canvasToDataURL(canvasRef.value)
      onCanvasChange?.(dataUrl)
    }
  }

  function reloadCanvasData() {
    if (canvasRef.value && canvasData.value) {
      initCanvas()
    }
  }

  watch(canvasData, (newData) => {
    if (newData && canvasRef.value && !isDrawing.value) {
      initCanvas()
    }
  })

  onMounted(() => {
    initCanvas()
    const canvas = canvasRef.value
    if (canvas) {
      canvas.addEventListener('mousedown', handleStart)
      canvas.addEventListener('mousemove', handleMove)
      canvas.addEventListener('mouseup', handleEnd)
      canvas.addEventListener('mouseleave', handleEnd)
      canvas.addEventListener('touchstart', handleStart, { passive: false })
      canvas.addEventListener('touchmove', handleMove, { passive: false })
      canvas.addEventListener('touchend', handleEnd, { passive: false })
      window.addEventListener('resize', initCanvas)
    }
  })

  onUnmounted(() => {
    const canvas = canvasRef.value
    if (canvas) {
      canvas.removeEventListener('mousedown', handleStart)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseup', handleEnd)
      canvas.removeEventListener('mouseleave', handleEnd)
      canvas.removeEventListener('touchstart', handleStart)
      canvas.removeEventListener('touchmove', handleMove)
      canvas.removeEventListener('touchend', handleEnd)
      window.removeEventListener('resize', initCanvas)
    }
  })

  return {
    isDrawing,
    clear,
    reloadCanvasData,
    initCanvas
  }
}
