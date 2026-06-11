import { useCallback, useRef, useState } from 'react'
import { zoomAtPoint, panView, resetView, type ViewState } from '../modules/editor/zoomUtils'

export type UseCanvasInteractionOptions = {
  zoomStep?: number
}

export type UseCanvasInteractionReturn = {
  viewState: ViewState
  handleWheel: (e: React.WheelEvent) => void
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleDoubleClick: () => void
  reset: () => void
}

export function useCanvasInteraction(
  options: UseCanvasInteractionOptions = {},
): UseCanvasInteractionReturn {
  const { zoomStep = 0.1 } = options

  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })

  const isDragging = useRef(false)
  const lastPosition = useRef({ x: 0, y: 0 })

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      const delta = e.deltaY > 0 ? 1 - zoomStep : 1 + zoomStep

      setViewState((prev) =>
        zoomAtPoint(
          prev,
          delta,
          { x: e.clientX, y: e.clientY },
          { width: window.innerWidth, height: window.innerHeight },
        ),
      )
    },
    [zoomStep],
  )

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return

    isDragging.current = true
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return

    const dx = e.clientX - lastPosition.current.x
    const dy = e.clientY - lastPosition.current.y

    lastPosition.current = { x: e.clientX, y: e.clientY }

    setViewState((prev) => panView(prev, dx, dy))
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleDoubleClick = useCallback(() => {
    setViewState(resetView())
  }, [])

  const reset = useCallback(() => {
    setViewState(resetView())
  }, [])

  return {
    viewState,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    reset,
  }
}
