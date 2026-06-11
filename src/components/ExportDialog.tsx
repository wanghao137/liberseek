import type { ExportProgress } from '../modules/export/exportProgress'

type ExportDialogProps = {
  isOpen: boolean
  onClose: () => void
  onExport: (type: 'image-package' | 'pdf-package' | 'readme') => void
  progress: ExportProgress | null
  isExporting: boolean
}

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  progress,
  isExporting,
}: ExportDialogProps) {
  if (!isOpen) return null

  return (
    <div className="export-dialog-overlay" onClick={onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>导出项目</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-content">
          {isExporting && progress ? (
            <div className="progress-section">
              <div className="progress-info">
                <span className="status">{progress.status === 'complete' ? '完成' : '导出中...'}</span>
                <span className="percentage">{progress.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="progress-message">{progress.message}</p>
            </div>
          ) : (
            <div className="export-options">
              <button
                type="button"
                className="export-option"
                onClick={() => onExport('image-package')}
              >
                <span className="icon">🖼️</span>
                <div className="option-info">
                  <strong>图片包</strong>
                  <span>包含 frame 图片、manifest 和 README</span>
                </div>
              </button>

              <button
                type="button"
                className="export-option"
                onClick={() => onExport('pdf-package')}
              >
                <span className="icon">📄</span>
                <div className="option-info">
                  <strong>PDF 包</strong>
                  <span>包含打印页面 PDF 和校准页</span>
                </div>
              </button>

              <button
                type="button"
                className="export-option"
                onClick={() => onExport('readme')}
              >
                <span className="icon">📋</span>
                <div className="option-info">
                  <strong>README</strong>
                  <span>中文组装说明</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <style>{`
          .export-dialog-overlay {
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

          .export-dialog {
            background: var(--paper-bright);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 400px;
            max-width: 90vw;
            animation: slideUp 0.2s ease;
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            border-bottom: 1px solid var(--line);
          }

          .dialog-header h2 {
            margin: 0;
            font-size: 18px;
            color: var(--ink);
          }

          .close-button {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            font-size: 24px;
            color: var(--ink-soft);
            cursor: pointer;
            border-radius: 6px;
          }

          .close-button:hover {
            background: var(--line);
            color: var(--ink);
          }

          .dialog-content {
            padding: 20px;
          }

          .export-options {
            display: grid;
            gap: 12px;
          }

          .export-option {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--paper);
            cursor: pointer;
            text-align: left;
            transition: all 0.15s ease;
          }

          .export-option:hover {
            border-color: var(--jade);
            background: rgba(30, 111, 85, 0.05);
          }

          .export-option .icon {
            font-size: 24px;
          }

          .export-option .option-info {
            display: grid;
            gap: 4px;
          }

          .export-option .option-info strong {
            font-size: 15px;
            color: var(--ink);
          }

          .export-option .option-info span {
            font-size: 13px;
            color: var(--ink-soft);
          }

          .progress-section {
            display: grid;
            gap: 16px;
          }

          .progress-info {
            display: flex;
            justify-content: space-between;
            font-weight: 800;
          }

          .progress-info .status {
            color: var(--ink);
          }

          .progress-info .percentage {
            color: var(--jade);
          }

          .progress-bar {
            height: 8px;
            background: var(--line);
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: var(--jade);
            border-radius: 4px;
            transition: width 0.3s ease;
          }

          .progress-message {
            margin: 0;
            font-size: 13px;
            color: var(--ink-soft);
            text-align: center;
          }
        `}</style>
      </div>
    </div>
  )
}
