import { useEffect } from 'react'

type PreviewMenuProps = {
  onSelect: (mode: 'flip' | '3d' | 'scroll') => void
  onClose: () => void
}

export function PreviewMenu({ onSelect, onClose }: PreviewMenuProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="preview-menu-overlay" onClick={onClose}>
      <div className="preview-menu" onClick={(e) => e.stopPropagation()}>
        <h3>选择预览模式</h3>
        <div className="preview-options">
          <button type="button" className="preview-option" onClick={() => { onSelect('flip'); onClose() }}>
            <span className="icon">📖</span>
            <div className="option-info">
              <strong>2D 翻页预览</strong>
              <span>逐页翻阅叶片内容</span>
            </div>
          </button>
          <button type="button" className="preview-option" onClick={() => { onSelect('3d'); onClose() }}>
            <span className="icon">🎮</span>
            <div className="option-info">
              <strong>3D 立体预览</strong>
              <span>三维空间查看装帧效果</span>
            </div>
          </button>
          <button type="button" className="preview-option" onClick={() => { onSelect('scroll'); onClose() }}>
            <span className="icon">📜</span>
            <div className="option-info">
              <strong>卷动预览</strong>
              <span>模拟长卷展开收卷效果</span>
            </div>
          </button>
        </div>
      </div>
      <style>{`
        .preview-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .preview-menu {
          background: var(--paper-bright);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 360px;
          padding: 20px;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .preview-menu h3 { margin: 0 0 16px; font-size: 18px; color: var(--ink); }
        .preview-options { display: grid; gap: 10px; }
        .preview-option {
          display: flex; align-items: center; gap: 14px;
          padding: 14px; border: 1px solid var(--line); border-radius: 8px;
          background: var(--paper); cursor: pointer; text-align: left;
          transition: all 0.15s ease;
        }
        .preview-option:hover { border-color: var(--jade); background: rgba(30, 111, 85, 0.05); }
        .preview-option .icon { font-size: 28px; }
        .preview-option .option-info { display: grid; gap: 3px; }
        .preview-option .option-info strong { font-size: 15px; color: var(--ink); }
        .preview-option .option-info span { font-size: 12px; color: var(--ink-soft); }
      `}</style>
    </div>
  )
}
