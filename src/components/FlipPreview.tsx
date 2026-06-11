import { useState, useCallback, useEffect } from 'react'
import { createPreviewState, nextPage, previousPage, formatPageIndicator, type PreviewState } from '../modules/editor/previewUtils'

type FlipPreviewProps = {
  totalLeaves: number
  leafImages: Array<{ id: string; url: string | null }>
  onClose: () => void
}

export function FlipPreview({ totalLeaves, leafImages, onClose }: FlipPreviewProps) {
  const [state, setState] = useState<PreviewState>(() => createPreviewState(totalLeaves))

  const handleNext = useCallback(() => {
    setState((prev) => nextPage(prev))
  }, [])

  const handlePrevious = useCallback(() => {
    setState((prev) => previousPage(prev))
  }, [])

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
      }
    },
    [handleNext, handlePrevious, onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const currentLeaf = leafImages[state.currentPage]

  return (
    <div className="flip-preview-overlay">
      <div className="flip-preview-container">
        <div className="flip-preview-header">
          <h2>翻页预览</h2>
          <span className="page-indicator">{formatPageIndicator(state)}</span>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="flip-preview-content">
          <button
            type="button"
            className="nav-btn prev-btn"
            onClick={handlePrevious}
            disabled={state.currentPage === 0}
          >
            ‹
          </button>

          <div className="flip-card">
            <div className="flip-card-inner">
              {currentLeaf?.url ? (
                <img src={currentLeaf.url} alt={`叶片 ${state.currentPage + 1}`} />
              ) : (
                <div className="empty-leaf">
                  <span>{state.currentPage + 1}</span>
                  <p>叶片未上传</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="nav-btn next-btn"
            onClick={handleNext}
            disabled={state.currentPage === state.totalPages - 1}
          >
            ›
          </button>
        </div>

        <div className="flip-preview-footer">
          <p>使用 ← → 键或点击按钮翻页，ESC 退出</p>
        </div>
      </div>

      <style>{`
        .flip-preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
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

        .flip-preview-container {
          width: 90vw;
          height: 90vh;
          display: flex;
          flex-direction: column;
          background: #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
        }

        .flip-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #222;
          border-bottom: 1px solid #333;
        }

        .flip-preview-header h2 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .page-indicator {
          color: #aaa;
          font-size: 14px;
          font-weight: 600;
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

        .flip-preview-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 24px;
        }

        .nav-btn {
          width: 48px;
          height: 48px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .flip-card {
          width: 100%;
          max-width: 600px;
          height: 100%;
          max-height: 500px;
          perspective: 1000px;
        }

        .flip-card-inner {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-card-inner img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .empty-leaf {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .empty-leaf span {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .empty-leaf p {
          margin: 0;
          font-size: 14px;
        }

        .flip-preview-footer {
          padding: 12px 24px;
          background: #222;
          border-top: 1px solid #333;
          text-align: center;
        }

        .flip-preview-footer p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
