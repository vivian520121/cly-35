import type { Note } from '@/types'

export async function exportNoteAsPNG(
  note: Note,
  canvasDataUrl: string
): Promise<void> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const scale = 2
  canvas.width = note.width * scale
  canvas.height = note.height * scale
  ctx.scale(scale, scale)

  ctx.fillStyle = note.style.backgroundColor
  ctx.globalAlpha = note.style.opacity
  ctx.fillRect(0, 0, note.width, note.height)
  ctx.globalAlpha = 1

  if (note.style.borderStyle !== 'none' && note.style.borderWidth > 0) {
    ctx.strokeStyle = note.style.borderColor
    ctx.lineWidth = note.style.borderWidth
    ctx.setLineDash(
      note.style.borderStyle === 'dashed'
        ? [8, 4]
        : note.style.borderStyle === 'dotted'
        ? [2, 2]
        : []
    )
    ctx.strokeRect(
      note.style.borderWidth / 2,
      note.style.borderWidth / 2,
      note.width - note.style.borderWidth,
      note.height - note.style.borderWidth
    )
    ctx.setLineDash([])
  }

  if (canvasDataUrl) {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = canvasDataUrl
    })
    ctx.drawImage(img, 0, 0, note.width, note.height)
  }

  if (note.text.content) {
    const padding = 16
    const headerHeight = 36
    const toolbarHeight = 48
    const textY = note.height - toolbarHeight - 20

    ctx.fillStyle = note.text.color
    ctx.font = `${note.text.fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif`
    ctx.textBaseline = 'top'

    const maxWidth = note.width - padding * 2
    const words = note.text.content.split('')
    let line = ''
    let y = textY

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n]
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, padding, y)
        line = words[n]
        y += note.text.fontSize + 4
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, padding, y)
  }

  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `便签_${note.id.slice(0, 8)}.png`
  link.href = dataUrl
  link.click()
}
