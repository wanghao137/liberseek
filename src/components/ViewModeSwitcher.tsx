type ViewMode = 'page' | 'eye' | 'grid' | 'link'

type ViewModeSwitcherProps = {
  currentMode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

const modes = [
  { id: 'page' as ViewMode, label: '页面视图', icon: '📄' },
  { id: 'eye' as ViewMode, label: '预览视图', icon: '👁️' },
  { id: 'grid' as ViewMode, label: '网格视图', icon: '🔲' },
  { id: 'link' as ViewMode, label: '链接视图', icon: '🔗' },
]

export function ViewModeSwitcher({ currentMode, onModeChange }: ViewModeSwitcherProps) {
  return (
    <div className="view-mode-switcher">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
          onClick={() => onModeChange(mode.id)}
          title={mode.label}
        >
          <span className="mode-icon">{mode.icon}</span>
        </button>
      ))}

      <style>{`
        .view-mode-switcher {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .mode-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .mode-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .mode-btn.active {
          background: #a33a2b;
          color: white;
        }

        .mode-icon {
          font-size: 18px;
        }
      `}</style>
    </div>
  )
}
