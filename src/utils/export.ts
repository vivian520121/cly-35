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

  const headerHeight = 36
  for (const todoBox of note.todoBoxes || []) {
    const boxX = todoBox.x
    const boxY = headerHeight + todoBox.y

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillRect(boxX, boxY, todoBox.width, todoBox.height)

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(boxX, boxY, todoBox.width, todoBox.height)

    const padding = 8
    const checkboxSize = 14
    const itemGap = 4
    const lineHeight = todoBox.style.fontSize + 4
    let itemY = boxY + padding

    ctx.font = `${todoBox.style.bold ? 'bold ' : ''}${todoBox.style.fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif`
    ctx.textBaseline = 'top'

    for (const item of todoBox.items) {
      const checkboxX = boxX + padding
      const textX = checkboxX + checkboxSize + 8

      if (item.completed) {
        ctx.fillStyle = '#10B981'
        ctx.fillRect(checkboxX, itemY, checkboxSize, checkboxSize)

        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(checkboxX + 3, itemY + 7)
        ctx.lineTo(checkboxX + 6, itemY + 10)
        ctx.lineTo(checkboxX + 11, itemY + 4)
        ctx.stroke()
      } else {
        ctx.strokeStyle = '#D1D5DB'
        ctx.lineWidth = 2
        ctx.strokeRect(checkboxX, itemY, checkboxSize, checkboxSize)
      }

      if (item.completed) {
        ctx.fillStyle = '#9CA3AF'
      } else {
        ctx.fillStyle = todoBox.style.color
      }
      ctx.fillText(item.text || '', textX, itemY - 1)

      if (item.completed) {
        const textWidth = ctx.measureText(item.text || '').width
        ctx.strokeStyle = '#9CA3AF'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(textX, itemY + checkboxSize / 2)
        ctx.lineTo(textX + textWidth, itemY + checkboxSize / 2)
        ctx.stroke()
      }

      itemY += lineHeight + itemGap
    }
  }

  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `便签_${note.id.slice(0, 8)}.png`
  link.href = dataUrl
  link.click()
}
