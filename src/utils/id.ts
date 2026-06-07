export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function getRandomNoteColor(): string {
  const colors = ['#FFF8C9', '#FFD3E0', '#CDE8FF', '#D4F5D4', '#E8D8FF']
  return colors[Math.floor(Math.random() * colors.length)]
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
