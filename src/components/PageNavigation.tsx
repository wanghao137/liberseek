type PageNavigationProps = {
  currentPage: number
  totalPages: number
  onFirst: () => void
  onPrev: () => void
  onPlay: () => void
  onNext: () => void
  onLast: () => void
  isPlaying?: boolean
}

export function PageNavigation({
  currentPage,
  totalPages,
  onFirst,
  onPrev,
  onPlay,
  onNext,
  onLast,
  isPlaying = false,
}: PageNavigationProps) {
  return (
    <div className="page-navigation">
      <button type="button" className="nav-btn" onClick={onFirst} disabled={currentPage === 0} title="第一页">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
        </svg>
      </button>
      <button type="button" className="nav-btn" onClick={onPrev} disabled={currentPage === 0} title="上一页">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button type="button" className={`nav-btn play-btn ${isPlaying ? 'playing' : ''}`} onClick={onPlay} title={isPlaying ? '暂停' : '播放'}>
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        )}
      </button>
      <button type="button" className="nav-btn" onClick={onNext} disabled={currentPage >= totalPages - 1} title="下一页">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <button type="button" className="nav-btn" onClick={onLast} disabled={currentPage >= totalPages - 1} title="最后一页">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
        </svg>
      </button>
      <span className="page-indicator">{currentPage + 1} / {totalPages}</span>

      <style>{`
        .page-navigation {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-btn.play-btn {
          width: 40px;
          height: 40px;
          background: #a33a2b;
          color: white;
          margin: 0 4px;
        }

        .nav-btn.play-btn:hover {
          background: #8b3020;
        }

        .nav-btn.play-btn.playing {
          background: #666;
        }

        .page-indicator {
          margin-left: 8px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          min-width: 60px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
