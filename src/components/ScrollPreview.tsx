import { useState, useCallback, useEffect, useRef } from 'react'
import { createPreviewState, nextPage, previousPage, formatPageIndicator, type PreviewState } from '../modules/editor/previewUtils'

type ScrollPreviewProps = {
  totalLeaves: number
  leafImages: Array<{ id: string; url: string | null }>
  onClose: () => void
}

export function ScrollPreview({ totalLeaves, leafImages, onClose }: ScrollPreviewProps) {
  const [state, setState] = useState<PreviewState>(() => createPreviewState(totalLeaves))
  const [scrollSpeed, setScrollSpeed] = useState(1)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<number | null>(null)

  const handleNext = useCallback(() => {
    setState((prev) => nextPage(prev))
  }, [])

  const handlePrevious = useCallback(() => {
    setState((prev) => previousPage(prev))
  }, [])

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev)
  }, [])

  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollRef.current = window.setInterval(() => {
        setState((prev) => {
          if (prev.currentPage >= prev.totalPages - 1) {
            setIsAutoScrolling(false)
            return prev
          }
          return nextPage(prev)
        })
      }, 2000 / scrollSpeed)
    } else if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = null
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [isAutoScrolling, scrollSpeed])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setScrollSpeed((prev) => Math.min(3, prev + 0.5))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setScrollSpeed((prev) => Math.max(0.5, prev - 0.5))
      }
    },
    [handleNext, handlePrevious, onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="scroll-preview-overlay">
      <div className="scroll-preview-container">
        <div className="scroll-preview-header">
          <h2>卷动预览</h2>
          <span className="page-indicator">{formatPageIndicator(state)}</span>
          <div className="controls">
            <button
              type="button"
              className={`auto-scroll-btn ${isAutoScrolling ? 'active' : ''}`}
              onClick={toggleAutoScroll}
            >
              {isAutoScrolling ? '⏸ 暂停' : '▶ 自动'}
            </button>
            <span className="speed-indicator">速度: {scrollSpeed.toFixed(1)}x</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="scroll-preview-content" ref={scrollRef}>
          <div className="scroll-track">
            {leafImages.map((leaf, index) => (
              <div
                key={leaf.id}
                className={`scroll-item ${index === state.currentPage ? 'active' : ''}`}
              >
                {leaf.url ? (
                  <img src={leaf.url} alt={`叶片 ${index + 1}`} />
                ) : (
                  <div className="empty-leaf">
                    <span>{index + 1}</span>
                  </div>
                )}
                <span className="leaf-number">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-preview-footer">
          <div className="nav-buttons">
            <button
              type="button"
              className="nav-btn"
              onClick={handlePrevious}
              disabled={state.currentPage === 0}
            >
              ‹ 上一页
            </button>
            <button
              type="button"
              className="nav-btn"
              onClick={handleNext}
              disabled={state.currentPage === state.totalPages - 1}
            >
              下一页 ›
            </button>
          </div>
          <p>使用 ← → 键翻页，↑ ↓ 调整速度，ESC 退出</p>
        </div>
      </div>

      <style>{`
        .scroll-preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .scroll-preview-container {
          width: 95vw;
          height: 95vh;
          display: flex;
          flex-direction: column;
          background: #111;
          border-radius: 12px;
          overflow: hidden;
        }

        .scroll-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #1a1a1a;
          border-bottom: 1px solid #333;
        }

        .scroll-preview-header h2 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .page-indicator {
          color: #aaa;
          font-size: 14px;
          font-weight: 600;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auto-scroll-btn {
          padding: 8px 16px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .auto-scroll-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .auto-scroll-btn.active {
          background: #1e6f55;
        }

        .speed-indicator {
          color: #888;
          font-size: 13px;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .scroll-preview-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .scroll-track {
          display: flex;
          gap: 16px;
          padding: 24px;
          height: 100%;
          align-items: center;
          transition: transform 0.5s ease;
          transform: translateX(calc(-${state.currentPage * 320}px));
        }

        .scroll-item {
          flex-shrink: 0;
          width: 300px;
          height: 100%;
          background: #222;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          opacity: 0.5;
          transform: scale(0.9);
        }

        .scroll-item.active {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .scroll-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .empty-leaf {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .empty-leaf span {
          font-size: 36px;
          font-weight: bold;
        }

        .leaf-number {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .scroll-preview-footer {
          padding: 16px 24px;
          background: #1a1a1a;
          border-top: 1px solid #333;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .nav-buttons {
          display: flex;
          gap: 12px;
        }

        .nav-btn {
          padding: 10px 20px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .scroll-preview-footer p {
          margin: 0;
          color: #666;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}
