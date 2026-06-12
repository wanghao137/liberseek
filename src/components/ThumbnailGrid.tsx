type ThumbnailGridProps = {
  items: Array<{ id: string; url: string | null; name?: string }>
  selectedIndex?: number
  onSelect: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  columns?: number
}

export function ThumbnailGrid({
  items,
  selectedIndex,
  onSelect,
  onReorder,
  columns = 5,
}: ThumbnailGridProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(fromIndex) && fromIndex !== toIndex && onReorder) {
      onReorder(fromIndex, toIndex)
    }
  }

  return (
    <div className="thumbnail-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`thumbnail-item ${selectedIndex === index ? 'selected' : ''}`}
          onClick={() => onSelect(index)}
          draggable={!!onReorder}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          <span className="thumbnail-index">{index + 1}</span>
          {item.url ? (
            <img src={item.url} alt={item.name || `插图 ${index + 1}`} />
          ) : (
            <div className="thumbnail-empty">
              <span>{index + 1}</span>
            </div>
          )}
          {item.name && <span className="thumbnail-name">{item.name}</span>}
        </div>
      ))}

      <style>{`
        .thumbnail-grid {
          display: grid;
          gap: 6px;
          padding: 8px;
        }

        .thumbnail-item {
          position: relative;
          aspect-ratio: 1;
          border: 2px solid transparent;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #f5f5f5;
        }

        .thumbnail-item:hover {
          border-color: rgba(163, 58, 43, 0.5);
          transform: scale(1.02);
        }

        .thumbnail-item.selected {
          border-color: #a33a2b;
          box-shadow: 0 0 0 2px rgba(163, 58, 43, 0.2);
        }

        .thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-index {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 4px;
          z-index: 1;
        }

        .thumbnail-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 12px;
        }

        .thumbnail-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2px 4px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 10px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  )
}
