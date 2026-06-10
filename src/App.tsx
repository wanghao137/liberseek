import { useMemo, useState } from 'react'
import './App.css'
import {
  computeDerivedDimensions,
  computeLeafLayout,
  validateBindingSettings,
  type BindingSettings,
} from './modules/binding/geometry'
import { DEFAULT_BINDING_SETTINGS } from './modules/binding/presets'

type NumericSettingKey =
  | 'artworkHeightCm'
  | 'visiblePageWidthCm'
  | 'pasteWidthCm'
  | 'sliceWidthCm'
  | 'leafCount'
  | 'dpi'

type MaterialSlot = {
  id: string
  title: string
  status: string
  meta: string
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
    label: '画心高度',
    min: 5,
    max: 80,
    step: 0.1,
    unit: '厘米',
  },
  {
    key: 'visiblePageWidthCm',
    label: '页面可视宽度',
    min: 5,
    max: 80,
    step: 0.1,
    unit: '厘米',
  },
  {
    key: 'pasteWidthCm',
    label: '粘贴宽度',
    min: 0.5,
    max: 10,
    step: 0.1,
    unit: '厘米',
  },
  {
    key: 'sliceWidthCm',
    label: '鳞片露出宽度',
    min: 0.5,
    max: 10,
    step: 0.1,
    unit: '厘米',
  },
  {
    key: 'leafCount',
    label: '叶片数量',
    min: 1,
    max: 80,
    step: 1,
    unit: '张',
  },
  {
    key: 'dpi',
    label: '导出精度',
    min: 72,
    max: 600,
    step: 1,
    unit: 'DPI',
  },
]

const materialSlots: MaterialSlot[] = [
  {
    id: 'front',
    title: '正面长卷',
    status: '未上传',
    meta: '展开时显示',
  },
  {
    id: 'back',
    title: '背面长卷',
    status: '未上传',
    meta: '收卷时参考',
  },
]

const edgeStyleLabels: Record<BindingSettings['edgeStyle'], string> = {
  straight: '直边',
  wave: '波浪',
  sawtooth: '锯齿',
}

function formatCm(value: number) {
  return `${Number(value.toFixed(2))} 厘米`
}

function App() {
  const [settings, setSettings] = useState<BindingSettings>(
    DEFAULT_BINDING_SETTINGS,
  )

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
  const visibleLeaves = leaves.slice(0, 8)

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
        <div className="brand-lockup">
          <span className="seal-mark">鳞</span>
          <div>
            <p className="eyebrow">LiberSeek 非遗装帧实验室</p>
            <h1>鳞卷工坊</h1>
          </div>
        </div>

        <nav className="toolbar" aria-label="项目工具">
          <button type="button">新建</button>
          <button type="button" disabled>
            导入
          </button>
          <button type="button" disabled>
            保存
          </button>
          <button type="button" disabled>
            导出
          </button>
          <button type="button" disabled>
            预览
          </button>
          <button type="button" disabled>
            帮助
          </button>
        </nav>
      </header>

      <section className="workspace" aria-label="龙鳞装编辑器">
        <aside className="side-panel material-panel" aria-label="素材">
          <div className="panel-title">
            <p className="eyebrow">素材</p>
            <h2>长卷与叶片</h2>
          </div>

          <div className="material-list">
            {materialSlots.map((slot) => (
              <section className="material-row" key={slot.id}>
                <div className="slot-thumb" aria-hidden="true" />
                <div>
                  <h3>{slot.title}</h3>
                  <p>{slot.meta}</p>
                </div>
                <span>{slot.status}</span>
              </section>
            ))}
          </div>

          <div className="leaf-stack">
            <div className="leaf-stack-header">
              <div>
                <h3>内页叶片</h3>
                <p>{settings.leafCount} 张</p>
              </div>
              <button type="button" disabled>
                批量添加
              </button>
            </div>

            <ol>
              {visibleLeaves.map((leaf) => (
                <li key={leaf.index}>
                  <span>{String(leaf.index + 1).padStart(2, '0')}</span>
                  <strong>叶片 {leaf.index + 1}</strong>
                  <em>空</em>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <section className="canvas-panel" aria-label="装帧画布">
          <div className="canvas-header">
            <div>
              <p className="eyebrow">二维装帧画布</p>
              <h2>龙鳞排布</h2>
            </div>
            <div className="canvas-meta">
              <span>{edgeStyleLabels[settings.edgeStyle]}</span>
              <span>{settings.leafCount} 张叶片</span>
            </div>
          </div>

          <div className="scroll-stage">
            <div
              className="scroll-base"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
              }}
            >
              <div className="ruler horizontal-ruler" aria-hidden="true" />
              <div className="ruler vertical-ruler" aria-hidden="true" />
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
                  <div className="visible-zone">
                    <span>{leaf.index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="side-panel inspector-panel" aria-label="参数">
          <div className="panel-title">
            <p className="eyebrow">参数</p>
            <h2>装帧设置</h2>
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

          <button
            className="reset-button"
            type="button"
            onClick={() => setSettings(DEFAULT_BINDING_SETTINGS)}
          >
            恢复默认预设
          </button>

          <dl className="metrics">
            <div>
              <dt>叶片物理宽度</dt>
              <dd>{formatCm(derived.leafPhysicalWidthCm)}</dd>
            </div>
            <div>
              <dt>长卷画心长度</dt>
              <dd>{formatCm(derived.scrollArtworkLengthCm)}</dd>
            </div>
            <div>
              <dt>页面结构数</dt>
              <dd>{derived.pageStructureCount}</dd>
            </div>
            <div>
              <dt>单张叶片像素</dt>
              <dd>
                {derived.frameWidthPx} x {derived.frameHeightPx}
              </dd>
            </div>
            <div>
              <dt>长卷像素</dt>
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
                <p className="validation ok">参数可用于测试导出</p>
              )}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
