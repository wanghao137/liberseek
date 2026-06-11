import { useState, useCallback, useRef } from 'react'

type DragDropListProps<T> = {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function DragDropList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
}: DragDropListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragItemRef = useRef<T | null>(null)

  const handleDragStart = useCallback((index: number, item: T) => {
    setDragIndex(index)
    dragItemRef.current = item
  }, [])

  const handleDragOver = useCallback((index: number) => {
    setOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const newItems = [...items]
      const [removed] = newItems.splice(dragIndex, 1)
      newItems.splice(overIndex, 0, removed)
      onReorder(newItems)
    }

    setDragIndex(null)
    setOverIndex(null)
    dragItemRef.current = null
  }, [dragIndex, overIndex, items, onReorder])

  const handleDragLeave = useCallback(() => {
    setOverIndex(null)
  }, [])

  return (
    <div className="drag-drop-list">
      {items.map((item, index) => {
        const key = keyExtractor(item)
        const isDragging = dragIndex === index
        const isOver = overIndex === index && dragIndex !== index

        return (
          <div
            key={key}
            className={`drag-drop-item ${isDragging ? 'dragging' : ''} ${isOver ? 'over' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index, item)}
            onDragOver={(e) => {
              e.preventDefault()
              handleDragOver(index)
            }}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
          >
            <div className="drag-handle">⋮⋮</div>
            <div className="item-content">
              {renderItem(item, index, isDragging)}
            </div>
          </div>
        )
      })}

      <style>{`
        .drag-drop-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .drag-drop-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: transparent;
          transition: all 0.15s ease;
          cursor: grab;
        }

        .drag-drop-item:hover {
          background: rgba(30, 111, 85, 0.05);
          border-color: rgba(30, 111, 85, 0.2);
        }

        .drag-drop-item.dragging {
          opacity: 0.5;
          background: rgba(30, 111, 85, 0.1);
          border-color: var(--jade);
        }

        .drag-drop-item.over {
          border-top: 2px solid var(--jade);
        }

        .drag-handle {
          color: var(--line-strong);
          font-size: 12px;
          cursor: grab;
          user-select: none;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .item-content {
          flex: 1;
          min-width: 0;
        }
      `}</style>
    </div>
  )
}
