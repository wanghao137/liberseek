type LoadingSpinnerProps = {
  size?: number
  color?: string
  text?: string
}

export function LoadingSpinner({ size = 40, color = '#1e6f55', text }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80, 200"
          strokeDashoffset="0"
        />
      </svg>
      {text && <p className="loading-text">{text}</p>}

      <style>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-text {
          margin: 0;
          color: var(--ink-soft);
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

type LoadingOverlayProps = {
  isVisible: boolean
  text?: string
}

export function LoadingOverlay({ isVisible, text = '加载中...' }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <LoadingSpinner text={text} />
      </div>

      <style>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .loading-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 32px;
        }
      `}</style>
    </div>
  )
}
