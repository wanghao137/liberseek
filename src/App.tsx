import { useMemo, useState } from 'react'
import './App.css'
import {
  computeDerivedDimensions,
  computeLeafLayout,
  validateBindingSettings,
  type BindingSettings,
} from './modules/binding/geometry'

type NumericSettingKey =
  | 'artworkHeightCm'
  | 'visiblePageWidthCm'
  | 'pasteWidthCm'
  | 'sliceWidthCm'
  | 'leafCount'
  | 'dpi'

const defaultSettings: BindingSettings = {
  artworkHeightCm: 30,
  visiblePageWidthCm: 22,
  pasteWidthCm: 2,
  sliceWidthCm: 2,
  leafCount: 23,
  edgeStyle: 'straight',
  orientation: 'horizontal',
  dpi: 300,
}

const controls: Array<{
  key: NumericSettingKey
  label: string
  min: number
  max: number
  step: number
  unit: string
}> = [
  {
    key: 'artworkHeightCm',
    label: 'Artwork height',
    min: 5,
    max: 80,
    step: 0.1,
    unit: 'cm',
  },
  {
    key: 'visiblePageWidthCm',
    label: 'Visible page width',
    min: 5,
    max: 80,
    step: 0.1,
    unit: 'cm',
  },
  {
    key: 'pasteWidthCm',
    label: 'Paste width',
    min: 0.5,
    max: 10,
    step: 0.1,
    unit: 'cm',
  },
  {
    key: 'sliceWidthCm',
    label: 'Slice width',
    min: 0.5,
    max: 10,
    step: 0.1,
    unit: 'cm',
  },
  {
    key: 'leafCount',
    label: 'Leaf count',
    min: 1,
    max: 80,
    step: 1,
    unit: 'leaves',
  },
  {
    key: 'dpi',
    label: 'Export DPI',
    min: 72,
    max: 600,
    step: 1,
    unit: 'dpi',
  },
]

function formatCm(value: number) {
  return `${Number(value.toFixed(2))} cm`
}

function App() {
  const [settings, setSettings] = useState<BindingSettings>(defaultSettings)

  const derived = useMemo(
    () => computeDerivedDimensions(settings),
    [settings],
  )
  const leaves = useMemo(() => computeLeafLayout(settings), [settings])
  const validation = useMemo(
    () => validateBindingSettings(settings),
    [settings],
  )

  const previewScale = 6
  const previewWidth = derived.scrollArtworkLengthCm * previewScale
  const previewHeight = settings.artworkHeightCm * previewScale

  function updateNumber(key: NumericSettingKey, value: string) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      return
    }

    setSettings((current) => ({
      ...current,
      [key]: key === 'leafCount' || key === 'dpi' ? Math.round(parsed) : parsed,
    }))
  }

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LiberSeek craft lab</p>
          <h1>Dragon Scale Studio</h1>
        </div>
        <div className="status-pill">Planning build</div>
      </header>

      <section className="workspace" aria-label="Dragon scale binding workspace">
        <aside className="panel settings-panel" aria-label="Binding settings">
          <div className="panel-heading">
            <h2>Binding setup</h2>
            <button type="button" onClick={() => setSettings(defaultSettings)}>
              Reset
            </button>
          </div>

          <div className="control-list">
            {controls.map((control) => (
              <label className="number-control" key={control.key}>
                <span>{control.label}</span>
                <div className="input-row">
                  <input
                    type="number"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={settings[control.key]}
                    onChange={(event) =>
                      updateNumber(control.key, event.target.value)
                    }
                  />
                  <strong>{control.unit}</strong>
                </div>
              </label>
            ))}
          </div>
        </aside>

        <section className="preview-panel" aria-label="Binding preview">
          <div className="preview-header">
            <div>
              <p className="eyebrow">WYSIWYG geometry</p>
              <h2>Leaf placement preview</h2>
            </div>
            <span>{settings.edgeStyle}</span>
          </div>

          <div className="scroll-stage">
            <div
              className="scroll-base"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
              }}
            >
              {leaves.map((leaf) => (
                <div
                  className="leaf"
                  key={leaf.index}
                  style={{
                    width: `${leaf.widthCm * previewScale}px`,
                    height: `${leaf.heightCm * previewScale}px`,
                    transform: `translateX(${leaf.xCm * previewScale}px)`,
                    zIndex: leaf.index + 1,
                  }}
                >
                  <div
                    className="paste-zone"
                    style={{
                      width: `${leaf.pasteRect.widthCm * previewScale}px`,
                    }}
                  />
                  <div className="leaf-number">{leaf.index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="panel metrics-panel" aria-label="Derived dimensions">
          <h2>Derived output</h2>
          <dl className="metrics">
            <div>
              <dt>Leaf physical width</dt>
              <dd>{formatCm(derived.leafPhysicalWidthCm)}</dd>
            </div>
            <div>
              <dt>Scroll artwork length</dt>
              <dd>{formatCm(derived.scrollArtworkLengthCm)}</dd>
            </div>
            <div>
              <dt>Page structures</dt>
              <dd>{derived.pageStructureCount}</dd>
            </div>
            <div>
              <dt>Frame pixels</dt>
              <dd>
                {derived.frameWidthPx} x {derived.frameHeightPx}
              </dd>
            </div>
            <div>
              <dt>Scroll pixels</dt>
              <dd>
                {derived.scrollWidthPx} x {derived.scrollHeightPx}
              </dd>
            </div>
          </dl>

          <div className="validation-list">
            {validation.errors.map((message) => (
              <p className="validation error" key={message}>
                {message}
              </p>
            ))}
            {validation.warnings.map((message) => (
              <p className="validation warning" key={message}>
                {message}
              </p>
            ))}
            {validation.errors.length === 0 &&
              validation.warnings.length === 0 && (
                <p className="validation ok">Geometry ready for test export</p>
              )}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
