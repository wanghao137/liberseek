import { useState } from 'react'

type WatermarkSettingsProps = {
  watermark: string
  onWatermarkChange: (watermark: string) => void
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  onPositionChange: (position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center') => void
  opacity: number
  onOpacityChange: (opacity: number) => void
}

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: '右下角' },
  { value: 'bottom-left', label: '左下角' },
  { value: 'top-right', label: '右上角' },
  { value: 'top-left', label: '左上角' },
  { value: 'center', label: '居中' },
] as const

export function WatermarkSettings({
  watermark,
  onWatermarkChange,
  position,
  onPositionChange,
  opacity,
  onOpacityChange,
}: WatermarkSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(!!watermark)

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled)
    if (!enabled) {
      onWatermarkChange('')
    } else if (!watermark) {
      onWatermarkChange('鳞卷工坊')
    }
  }

  return (
    <div className="watermark-settings">
      <div className="setting-row">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <span>启用水印</span>
        </label>
      </div>

      {isEnabled && (
        <>
          <div className="setting-row">
            <label>水印文字</label>
            <input
              type="text"
              value={watermark}
              onChange={(e) => onWatermarkChange(e.target.value)}
              placeholder="输入水印文字"
              className="text-input"
            />
          </div>

          <div className="setting-row">
            <label>位置</label>
            <select
              value={position}
              onChange={(e) => onPositionChange(e.target.value as any)}
              className="select-input"
            >
              {POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-row">
            <label>
              <span>透明度</span>
              <span className="value">{Math.round(opacity * 100)}%</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="range-input"
            />
          </div>
        </>
      )}

      <style>{`
        .watermark-settings {
          display: grid;
          gap: 12px;
          padding: 12px;
          background: rgba(30, 111, 85, 0.05);
          border-radius: 8px;
        }

        .setting-row {
          display: grid;
          gap: 6px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }

        .toggle-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--jade);
        }

        .setting-row label {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
        }

        .setting-row label .value {
          float: right;
          color: var(--ink);
        }

        .text-input,
        .select-input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: var(--paper-bright);
          font-size: 13px;
          color: var(--ink);
        }

        .text-input:focus,
        .select-input:focus {
          outline: none;
          border-color: var(--jade);
        }

        .range-input {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--line);
          outline: none;
          -webkit-appearance: none;
        }

        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--jade);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
