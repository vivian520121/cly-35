import type { Point } from '@/types'

export function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect()
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number
): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.restore()
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number
): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.rect(
    Math.min(from.x, to.x),
    Math.min(from.y, to.y),
    Math.abs(to.x - from.x),
    Math.abs(to.y - from.y)
  )
  ctx.stroke()
  ctx.restore()
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number
): void {
  const centerX = (from.x + to.x) / 2
  const centerY = (from.y + to.y) / 2
  const radiusX = Math.abs(to.x - from.x) / 2
  const radiusY = Math.abs(to.y - from.y) / 2

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function startEraser(ctx: CanvasRenderingContext2D): void {
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

export function stopEraser(ctx: CanvasRenderingContext2D): void {
  ctx.globalCompositeOperation = 'source-over'
}

export function loadImageToCanvas(
  canvas: HTMLCanvasElement,
  dataUrl: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!dataUrl) {
      resolve()
      return
    }
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      resolve()
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}
