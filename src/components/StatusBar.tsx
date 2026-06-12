type StatusBarProps = {
  scrollWidthCm: number
  scrollHeightCm: number
  artworkWidthCm: number
  artworkHeightCm: number
  illustrationCount: number
}

export function StatusBar({
  scrollWidthCm,
  scrollHeightCm,
  artworkWidthCm,
  artworkHeightCm,
  illustrationCount,
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <span className="status-item">
        <span className="status-label">导轨:</span>
        <span className="status-value">{scrollWidthCm.toFixed(1)}cm x {scrollHeightCm.toFixed(1)}cm</span>
      </span>
      <span className="status-divider">|</span>
      <span className="status-item">
        <span className="status-label">画心:</span>
        <span className="status-value">{artworkWidthCm}cm x {artworkHeightCm}cm</span>
      </span>
      <span className="status-divider">|</span>
      <span className="status-item">
        <span className="status-label">插图:</span>
        <span className="status-value">{illustrationCount}</span>
      </span>

      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 12px;
          color: #666;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-label {
          color: #999;
        }

        .status-value {
          color: #333;
          font-weight: 600;
        }

        .status-divider {
          color: #ddd;
        }
      `}</style>
    </div>
  )
}
