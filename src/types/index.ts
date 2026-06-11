export interface NoteStyle {
  backgroundColor: string
  opacity: number
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none'
  borderColor: string
  borderWidth: number
}

export type ToolType = 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'text'

export interface DrawingSettings {
  currentTool: ToolType
  strokeColor: string
  strokeWidth: number
}

export interface TextSettings {
  content: string
  color: string
  fontSize: number
}

export interface Note {
  id: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  style: NoteStyle
  canvasData: string
  text: TextSettings
  drawing: DrawingSettings
  isActive: boolean
  isMinimized: boolean
  createdAt: string
  updatedAt: string
}

export interface AppState {
  notes: Note[]
  activeNoteId: string | null
  maxZIndex: number
}

export interface Point {
  x: number
  y: number
}

export const NOTE_COLORS = [
  '#FFF8C9',
  '#FFD3E0',
  '#CDE8FF',
  '#D4F5D4',
  '#E8D8FF',
  '#FFFFFF'
]

export const STROKE_COLORS = [
  '#000000',
  '#FF0000',
  '#00AA00',
  '#0000FF',
  '#FFA500',
  '#800080',
  '#FF69B4',
  '#008080'
]

export const BORDER_STYLES: Array<{ label: string; value: NoteStyle['borderStyle'] }> = [
  { label: '无', value: 'none' },
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' }
]
