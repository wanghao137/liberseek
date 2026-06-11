import { useState } from 'react'
import { getTemplateList, createProjectFromTemplate, type Template } from '../modules/editor/templateUtils'

type TemplateSelectorProps = {
  onSelect: (project: ReturnType<typeof createProjectFromTemplate>) => void
  onClose: () => void
}

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const templates = getTemplateList()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (template: Template) => {
    setSelectedId(template.id)
  }

  const handleConfirm = () => {
    const template = templates.find((t) => t.id === selectedId)
    if (template) {
      const project = createProjectFromTemplate(template)
      onSelect(project)
      onClose()
    }
  }

  return (
    <div className="template-selector-overlay" onClick={onClose}>
      <div className="template-selector" onClick={(e) => e.stopPropagation()}>
        <div className="selector-header">
          <h2>选择模板</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="selector-content">
          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
                onClick={() => handleSelect(template)}
              >
                <div className="template-icon">{template.icon}</div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span>{template.settings.leafCount} 叶</span>
                  <span>{template.settings.artworkHeightCm}cm 高</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="selector-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            使用模板
          </button>
        </div>
      </div>

      <style>{`
        .template-selector-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .template-selector {
          background: var(--paper-bright);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 600px;
          max-width: 90vw;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--line);
        }

        .selector-header h2 {
          margin: 0;
          font-size: 18px;
          color: var(--ink);
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 24px;
          color: var(--ink-soft);
          cursor: pointer;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: var(--line);
          color: var(--ink);
        }

        .selector-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        .template-card {
          padding: 16px;
          border: 2px solid var(--line);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .template-card:hover {
          border-color: var(--jade);
          background: rgba(30, 111, 85, 0.05);
        }

        .template-card.selected {
          border-color: var(--jade);
          background: rgba(30, 111, 85, 0.1);
        }

        .template-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .template-card h3 {
          margin: 0 0 4px;
          font-size: 15px;
          color: var(--ink);
        }

        .template-card p {
          margin: 0 0 8px;
          font-size: 12px;
          color: var(--ink-soft);
          line-height: 1.4;
        }

        .template-meta {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          color: var(--line-strong);
        }

        .selector-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--line);
        }

        .cancel-btn,
        .confirm-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: var(--line);
          color: var(--ink);
        }

        .cancel-btn:hover {
          background: var(--line-strong);
        }

        .confirm-btn {
          background: var(--jade);
          color: #fff;
        }

        .confirm-btn:hover:not(:disabled) {
          background: #175a45;
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
