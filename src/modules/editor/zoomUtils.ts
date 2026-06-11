export type ViewState = {
  scale: number
  offsetX: number
  offsetY: number
}

export const ZOOM_LIMITS = {
  min: 0.1,
  max: 5,
  step: 0.1,
}

export const DEFAULT_VIEW_STATE: ViewState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

export function constrainZoom(
  zoom: number,
  min: number = ZOOM_LIMITS.min,
  max: number = ZOOM_LIMITS.max,
): number {
  if (!Number.isFinite(zoom)) {
    return 1
  }

  return Math.max(min, Math.min(max, zoom))
}

export function zoomAtPoint(
  state: ViewState,
  delta: number,
  point: { x: number; y: number },
  _canvasSize: { width: number; height: number },
): ViewState {
  const newScale = constrainZoom(state.scale * delta)

  const scaleChange = newScale / state.scale

  const newOffsetX = point.x - (point.x - state.offsetX) * scaleChange
  const newOffsetY = point.y - (point.y - state.offsetY) * scaleChange

  return {
    scale: newScale,
    offsetX: newOffsetX,
    offsetY: newOffsetY,
  }
}

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`
}

export function resetView(): ViewState {
  return { ...DEFAULT_VIEW_STATE }
}

export function panView(
  state: ViewState,
  dx: number,
  dy: number,
): ViewState {
  return {
    ...state,
    offsetX: state.offsetX + dx,
    offsetY: state.offsetY + dy,
  }
}

export function isViewDefault(state: ViewState): boolean {
  return (
    state.scale === DEFAULT_VIEW_STATE.scale &&
    state.offsetX === DEFAULT_VIEW_STATE.offsetX &&
    state.offsetY === DEFAULT_VIEW_STATE.offsetY
  )
}
