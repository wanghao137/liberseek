type NotificationBellProps = {
  count?: number
  onClick?: () => void
}

export function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  return (
    <button type="button" className="notification-bell" onClick={onClick} title="通知">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {count > 0 && <span className="notification-badge">{count > 99 ? '99+' : count}</span>}
      <style>{`
        .notification-bell {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .notification-bell:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: #a33a2b;
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </button>
  )
}

type HistoryButtonProps = {
  onClick?: () => void
}

export function HistoryButton({ onClick }: HistoryButtonProps) {
  return (
    <button type="button" className="history-button" onClick={onClick} title="历史记录">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <style>{`
        .history-button {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .history-button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }
      `}</style>
    </button>
  )
}

type RecordButtonProps = {
  isRecording?: boolean
  onClick?: () => void
}

export function RecordButton({ isRecording = false, onClick }: RecordButtonProps) {
  return (
    <button type="button" className={`record-button ${isRecording ? 'recording' : ''}`} onClick={onClick} title={isRecording ? '停止录制' : '开始录制'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isRecording ? '#ff0000' : 'none'} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        {isRecording && <circle cx="12" cy="12" r="4" fill="#ff0000"/>}
      </svg>
      <style>{`
        .record-button {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .record-button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }

        .record-button.recording {
          color: #ff0000;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </button>
  )
}
