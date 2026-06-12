import { formatZoom } from '../modules/editor/zoomUtils'

type ZoomIndicatorProps = {
  scale: number
  onReset: () => void
}

export function ZoomIndicator({ scale, onReset }: ZoomIndicatorProps) {
  return (
    <div className="zoom-indicator">
      <span className="zoom-value">{formatZoom(scale)}</span>
      <button type="button" className="reset-btn" onClick={onReset}>
        重置
      </button>

      <style>{`
        .zoom-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 6px;
          position: absolute;
          bottom: 16px;
          right: 16px;
          z-index: 100;
        }

        .zoom-value {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          font-family: monospace;
        }

        .reset-btn {
          padding: 4px 8px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .reset-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}
