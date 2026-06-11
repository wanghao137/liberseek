import { constrainScale, constrainRotation, formatScale, formatRotation, type TransformOptions } from '../modules/editor/transformUtils'

type ImageAdjustmentPanelProps = {
  transform: TransformOptions
  onChange: (transform: TransformOptions) => void
  onReset: () => void
  disabled?: boolean
}

export function ImageAdjustmentPanel({
  transform,
  onChange,
  onReset,
  disabled = false,
}: ImageAdjustmentPanelProps) {
  const handleScaleChange = (value: number) => {
    onChange({
      ...transform,
      scale: constrainScale(value),
    })
  }

  const handleRotationChange = (value: number) => {
    onChange({
      ...transform,
      rotationDeg: constrainRotation(value),
    })
  }

  const handlePositionXChange = (value: number) => {
    onChange({
      ...transform,
      xCm: value,
    })
  }

  const handlePositionYChange = (value: number) => {
    onChange({
      ...transform,
      yCm: value,
    })
  }

  return (
    <div className="image-adjustment-panel">
      <div className="panel-header">
        <h3>图片调整</h3>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="reset-button"
        >
          重置
        </button>
      </div>

      <div className="adjustment-controls">
        <div className="control-group">
          <label>
            <span>缩放</span>
            <span className="value">{formatScale(transform.scale)}</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={transform.scale}
            onChange={(e) => handleScaleChange(Number(e.target.value))}
            disabled={disabled}
          />
          <div className="range-labels">
            <span>10%</span>
            <span>500%</span>
          </div>
        </div>

        <div className="control-group">
          <label>
            <span>旋转</span>
            <span className="value">{formatRotation(transform.rotationDeg)}</span>
          </label>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={transform.rotationDeg}
            onChange={(e) => handleRotationChange(Number(e.target.value))}
            disabled={disabled}
          />
          <div className="range-labels">
            <span>-180°</span>
            <span>180°</span>
          </div>
        </div>

        <div className="control-group">
          <label>
            <span>水平位置</span>
            <span className="value">{transform.xCm.toFixed(1)} cm</span>
          </label>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.1}
            value={transform.xCm}
            onChange={(e) => handlePositionXChange(Number(e.target.value))}
            disabled={disabled}
          />
        </div>

        <div className="control-group">
          <label>
            <span>垂直位置</span>
            <span className="value">{transform.yCm.toFixed(1)} cm</span>
          </label>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.1}
            value={transform.yCm}
            onChange={(e) => handlePositionYChange(Number(e.target.value))}
            disabled={disabled}
          />
        </div>
      </div>

      <style>{`
        .image-adjustment-panel {
          padding: 16px;
          border-top: 1px solid rgba(31, 39, 35, 0.12);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 15px;
          color: var(--ink);
        }

        .adjustment-controls {
          display: grid;
          gap: 16px;
        }

        .control-group {
          display: grid;
          gap: 6px;
        }

        .control-group label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 800;
          color: var(--ink-soft);
        }

        .control-group label .value {
          color: var(--ink);
          font-weight: 900;
        }

        .control-group input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--line);
          outline: none;
          -webkit-appearance: none;
        }

        .control-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--jade);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .control-group input[type="range"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--ink-soft);
        }

        .reset-button {
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid rgba(163, 58, 43, 0.24);
          border-radius: 4px;
          background: transparent;
          color: var(--cinnabar);
          cursor: pointer;
        }

        .reset-button:hover:not(:disabled) {
          background: rgba(163, 58, 43, 0.1);
        }

        .reset-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
