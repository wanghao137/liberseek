import { cmToPx } from '../binding/geometry'

export type Position = {
  x: number
  y: number
}

export type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export type DragState = {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function constrainPosition(
  position: Position,
  bounds: Bounds,
): Position {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
  }
}

export function calculateDragDelta(
  start: Position,
  current: Position,
): { dx: number; dy: number } {
  return {
    dx: current.x - start.x,
    dy: current.y - start.y,
  }
}

export function positionToCm(px: number, dpi: number): number {
  return px / dpi * 2.54
}

export function cmToPosition(cm: number, dpi: number): number {
  return cmToPx(cm, dpi)
}

export function createDragState(): DragState {
  return {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  }
}

export function startDrag(
  state: DragState,
  x: number,
  y: number,
): DragState {
  return {
    ...state,
    isDragging: true,
    startX: x,
    startY: y,
    currentX: x,
    currentY: y,
  }
}

export function updateDrag(
  state: DragState,
  x: number,
  y: number,
): DragState {
  if (!state.isDragging) {
    return state
  }

  return {
    ...state,
    currentX: x,
    currentY: y,
  }
}

export function endDrag(state: DragState): DragState {
  return {
    ...state,
    isDragging: false,
  }
}

export function getDragDelta(state: DragState): { dx: number; dy: number } {
  return calculateDragDelta(
    { x: state.startX, y: state.startY },
    { x: state.currentX, y: state.currentY },
  )
}
