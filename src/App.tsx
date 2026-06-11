import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  computeDerivedDimensions,
  computeLeafLayout,
  validateBindingSettings,
  type BindingSettings,
} from './modules/binding/geometry'
import {
  createWorkshopProject,
  updateProjectSettings,
  type ProjectAssetRole,
} from './modules/project/project'
import {
  clearActiveDraft,
  loadActiveDraft,
  saveActiveDraft,
  toRuntimeDraftProject,
  type RuntimeDraftAsset,
  type RuntimeDraftProject,
} from './modules/storage/draft'

type NumericSettingKey =
  | 'artworkHeightCm'
  | 'visiblePageWidthCm'
  | 'pasteWidthCm'
  | 'sliceWidthCm'
  | 'leafCount'
  | 'dpi'

type MaterialRole = Extract<ProjectAssetRole, 'front' | 'back'>

type MaterialSlot = {
  id: MaterialRole
  title: string
  emptyMeta: string
  loadedMeta: string
}

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

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
    emptyMeta: '展开时显示',
    loadedMeta: '正面长卷已载入',
  },
  {
    id: 'back',
    title: '背面长卷',
    emptyMeta: '收卷时参考',
    loadedMeta: '背面长卷已载入',
  },
]

const edgeStyleLabels: Record<BindingSettings['edgeStyle'], string> = {
  straight: '直边',
  wave: '波浪',
  sawtooth: '锯齿',
}

function createRuntimeProject(): RuntimeDraftProject {
  return createWorkshopProject() as RuntimeDraftProject
}

function formatCm(value: number) {
  return `${Number(value.toFixed(2))} 厘米`
}

function formatPixels(asset: RuntimeDraftAsset) {
  if (asset.widthPx === null || asset.heightPx === null) {
    return '尺寸待识别'
  }

  return `${asset.widthPx} x ${asset.heightPx}px`
}

function createAssetId(role: ProjectAssetRole) {
  return `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function readImageSize(previewUrl: string): Promise<{
  widthPx: number | null
  heightPx: number | null
}> {
  return new Promise((resolve) => {
    const image = new Image()

    image.onload = () => {
      resolve({
        widthPx: image.naturalWidth,
        heightPx: image.naturalHeight,
      })
    }
    image.onerror = () => {
      resolve({
        widthPx: null,
        heightPx: null,
      })
    }
    image.src = previewUrl
  })
}

function getImageFiles(files: FileList | null): File[] {
  return Array.from(files ?? []).filter((file) => file.type.startsWith('image/'))
}

function App() {
  const [project, setProject] = useState<RuntimeDraftProject>(() =>
    createRuntimeProject(),
  )
  const [notice, setNotice] = useState('正在检查本地草稿。')
  const [saveStatus, setSaveStatus] = useState('尚未保存')
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const leavesInputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const draftReadyRef = useRef(false)
  const autoSaveTimerRef = useRef<number | undefined>(undefined)

  const settings = project.settings
  const derived = useMemo(
    () => computeDerivedDimensions(settings),
    [settings],
  )
  const leaves = useMemo(() => computeLeafLayout(settings), [settings])
  const validation = useMemo(
    () => validateBindingSettings(settings),
    [settings],
  )
  const assetMap = useMemo(
    () => new Map(project.assets.map((asset) => [asset.id, asset])),
    [project.assets],
  )
  const frontAsset = project.assets.find((asset) => asset.role === 'front')
  const backAsset = project.assets.find((asset) => asset.role === 'back')
  const assignedLeafCount = project.leaves.filter((leaf) => leaf.assetId).length
  const missingLeafCount = Math.max(0, settings.leafCount - assignedLeafCount)

  const previewScale = 6
  const previewWidth = derived.scrollArtworkLengthCm * previewScale
  const previewHeight = settings.artworkHeightCm * previewScale

  useEffect(() => {
    const objectUrls = objectUrlsRef.current

    return () => {
      if (autoSaveTimerRef.current !== undefined) {
        window.clearTimeout(autoSaveTimerRef.current)
      }
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
      objectUrls.clear()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void loadActiveDraft()
      .then((storedProject) => {
        if (cancelled) {
          return
        }

        if (!storedProject) {
          setNotice('未发现本地草稿，已创建新项目。')
          setSaveStatus('等待首次自动保存')
          return
        }

        const restored = toRuntimeDraftProject(storedProject, (blob) => {
          const previewUrl = URL.createObjectURL(blob)

          objectUrlsRef.current.add(previewUrl)
          return previewUrl
        })

        setProject(restored)
        setNotice('已恢复本地草稿。')
        setSaveStatus('已从本地恢复')
      })
      .catch(() => {
        if (!cancelled) {
          setNotice('本地草稿读取失败，已进入新项目。')
          setSaveStatus('读取失败')
        }
      })
      .finally(() => {
        if (!cancelled) {
          draftReadyRef.current = true
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!draftReadyRef.current) {
      return
    }

    if (autoSaveTimerRef.current !== undefined) {
      window.clearTimeout(autoSaveTimerRef.current)
    }

    setSaveStatus('正在自动保存...')
    autoSaveTimerRef.current = window.setTimeout(() => {
      void saveActiveDraft(project)
        .then(() => {
          setSaveStatus(`已自动保存 ${new Date().toLocaleTimeString('zh-CN')}`)
        })
        .catch(() => {
          setSaveStatus('自动保存失败')
        })
    }, 450)

    return () => {
      if (autoSaveTimerRef.current !== undefined) {
        window.clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [project])

  async function createRuntimeAsset(
    file: File,
    role: ProjectAssetRole,
  ): Promise<RuntimeDraftAsset> {
    const previewUrl = URL.createObjectURL(file)
    objectUrlsRef.current.add(previewUrl)
    const size = await readImageSize(previewUrl)

    return {
      id: createAssetId(role),
      role,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      widthPx: size.widthPx,
      heightPx: size.heightPx,
      blob: file,
      previewUrl,
    }
  }

  function revokeAsset(asset: RuntimeDraftAsset) {
    URL.revokeObjectURL(asset.previewUrl)
    objectUrlsRef.current.delete(asset.previewUrl)
  }

  async function persistNow(message = '已保存到本地草稿。') {
    setSaveStatus('正在保存...')

    try {
      await saveActiveDraft(project)
      setSaveStatus(`${message} ${new Date().toLocaleTimeString('zh-CN')}`)
    } catch {
      setSaveStatus('保存失败')
      setNotice('本地草稿保存失败，请检查浏览器存储权限。')
    }
  }

  async function handleNewProject() {
    const shouldReset = window.confirm(
      '新建项目会清空当前本地草稿和已上传素材，是否继续？',
    )

    if (!shouldReset) {
      return
    }

    project.assets.forEach(revokeAsset)
    const nextProject = createRuntimeProject()

    setProject(nextProject)
    setNotice('已新建项目，本地草稿已重置。')
    setSaveStatus('正在重置本地草稿...')

    try {
      await clearActiveDraft()
      await saveActiveDraft(nextProject)
      setSaveStatus('已保存新项目草稿')
    } catch {
      setSaveStatus('重置保存失败')
    }
  }

  function updateNumber(key: NumericSettingKey, value: string) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      return
    }

    const nextValue =
      key === 'leafCount' || key === 'dpi' ? Math.round(parsed) : parsed

    setProject((current) => {
      const resized = updateProjectSettings(
        current,
        {
          [key]: nextValue,
        },
      ) as RuntimeDraftProject
      const liveLeafAssetIds = new Set(
        resized.leaves
          .map((leaf) => leaf.assetId)
          .filter((assetId): assetId is string => assetId !== null),
      )
      const removedLeafAssets = resized.assets.filter(
        (asset) => asset.role === 'leaf' && !liveLeafAssetIds.has(asset.id),
      )

      removedLeafAssets.forEach(revokeAsset)

      return {
        ...resized,
        assets: resized.assets.filter(
          (asset) => asset.role !== 'leaf' || liveLeafAssetIds.has(asset.id),
        ),
      }
    })
  }

  async function handleMaterialUpload(role: MaterialRole, files: FileList | null) {
    const [file] = getImageFiles(files)

    if (!file) {
      setNotice('请选择 PNG、JPG、WebP 或 GIF 图片文件。')
      return
    }

    const asset = await createRuntimeAsset(file, role)

    setProject((current) => {
      const removed = current.assets.filter((item) => item.role === role)
      removed.forEach(revokeAsset)

      return {
        ...current,
        updatedAt: new Date().toISOString(),
        assets: [
          ...current.assets.filter((item) => item.role !== role),
          asset,
        ],
      }
    })
    setNotice(`${role === 'front' ? '正面长卷' : '背面长卷'}已载入：${file.name}`)
  }

  async function handleLeafBatchUpload(files: FileList | null) {
    const imageFiles = getImageFiles(files)

    if (imageFiles.length === 0) {
      setNotice('请选择 PNG、JPG、WebP 或 GIF 图片文件。')
      return
    }

    const assets = await Promise.all(
      imageFiles.map((file) => createRuntimeAsset(file, 'leaf')),
    )

    setProject((current) => {
      const firstEmptyIndex = current.leaves.findIndex((leaf) => !leaf.assetId)
      const startIndex =
        firstEmptyIndex === -1 ? current.leaves.length : firstEmptyIndex
      const requiredLeafCount = startIndex + assets.length
      const base =
        requiredLeafCount > current.leaves.length
          ? (updateProjectSettings(current, {
              leafCount: requiredLeafCount,
            }) as RuntimeDraftProject)
          : current
      const leavesWithAssets = base.leaves.map((leaf) => ({ ...leaf }))

      assets.forEach((asset, index) => {
        leavesWithAssets[startIndex + index] = {
          ...leavesWithAssets[startIndex + index],
          assetId: asset.id,
        }
      })

      return {
        ...base,
        updatedAt: new Date().toISOString(),
        assets: [...base.assets, ...assets],
        leaves: leavesWithAssets,
      }
    })
    setNotice(`已添加 ${assets.length} 张内页素材。`)
  }

  async function handleLeafReplace(leafId: string, files: FileList | null) {
    const [file] = getImageFiles(files)

    if (!file) {
      setNotice('请选择 PNG、JPG、WebP 或 GIF 图片文件。')
      return
    }

    const asset = await createRuntimeAsset(file, 'leaf')

    setProject((current) => {
      const leaf = current.leaves.find((item) => item.id === leafId)
      const removed = leaf?.assetId
        ? current.assets.find((item) => item.id === leaf.assetId)
        : undefined

      if (removed) {
        revokeAsset(removed)
      }

      return {
        ...current,
        updatedAt: new Date().toISOString(),
        assets: [
          ...current.assets.filter((item) => item.id !== leaf?.assetId),
          asset,
        ],
        leaves: current.leaves.map((item) =>
          item.id === leafId ? { ...item, assetId: asset.id } : item,
        ),
      }
    })
    setNotice(`已更新叶片素材：${file.name}`)
  }

  function removeMaterial(role: MaterialRole) {
    setProject((current) => {
      const removed = current.assets.filter((asset) => asset.role === role)
      removed.forEach(revokeAsset)

      return {
        ...current,
        updatedAt: new Date().toISOString(),
        assets: current.assets.filter((asset) => asset.role !== role),
      }
    })
    setNotice(`${role === 'front' ? '正面长卷' : '背面长卷'}已移除。`)
  }

  function removeLeafAsset(leafId: string) {
    setProject((current) => {
      const leaf = current.leaves.find((item) => item.id === leafId)
      const removed = leaf?.assetId
        ? current.assets.find((item) => item.id === leaf.assetId)
        : undefined

      if (removed) {
        revokeAsset(removed)
      }

      return {
        ...current,
        updatedAt: new Date().toISOString(),
        assets: current.assets.filter((asset) => asset.id !== leaf?.assetId),
        leaves: current.leaves.map((item) =>
          item.id === leafId ? { ...item, assetId: null } : item,
        ),
      }
    })
    setNotice('叶片素材已移除。')
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
          <button type="button" onClick={() => void handleNewProject()}>
            新建
          </button>
          <button type="button" onClick={() => leavesInputRef.current?.click()}>
            导入
          </button>
          <button type="button" onClick={() => void persistNow()}>
            保存
          </button>
          <button type="button" disabled title="打印导出将在项目包稳定后接入">
            导出
          </button>
          <button type="button" disabled title="预览将在画布编辑器稳定后接入">
            预览
          </button>
          <button type="button" disabled title="帮助文档将在导出流程后补齐">
            帮助
          </button>
        </nav>
      </header>

      <section className="workspace" aria-label="龙鳞装编辑器">
        <aside className="side-panel material-panel" aria-label="素材">
          <div className="panel-title">
            <p className="eyebrow">素材</p>
            <h2>长卷与叶片</h2>
            <p className="panel-note">{notice}</p>
            <p className="save-status">{saveStatus}</p>
          </div>

          <input
            ref={frontInputRef}
            className="hidden-input"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={(event) => {
              void handleMaterialUpload('front', event.currentTarget.files)
              event.currentTarget.value = ''
            }}
          />
          <input
            ref={backInputRef}
            className="hidden-input"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={(event) => {
              void handleMaterialUpload('back', event.currentTarget.files)
              event.currentTarget.value = ''
            }}
          />
          <input
            ref={leavesInputRef}
            className="hidden-input"
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            onChange={(event) => {
              void handleLeafBatchUpload(event.currentTarget.files)
              event.currentTarget.value = ''
            }}
          />

          <div className="material-list">
            {materialSlots.map((slot) => {
              const asset = slot.id === 'front' ? frontAsset : backAsset

              return (
                <section
                  className={`material-row ${asset ? 'is-loaded' : ''}`}
                  key={slot.id}
                >
                  <div className="slot-thumb" aria-hidden="true">
                    {asset && <img alt="" src={asset.previewUrl} />}
                  </div>
                  <div className="material-body">
                    <h3>{slot.title}</h3>
                    <p>{asset ? asset.name : slot.emptyMeta}</p>
                    <small>{asset ? formatPixels(asset) : '未上传'}</small>
                  </div>
                  <div className="material-actions">
                    <button
                      type="button"
                      onClick={() =>
                        slot.id === 'front'
                          ? frontInputRef.current?.click()
                          : backInputRef.current?.click()
                      }
                    >
                      {asset ? '替换' : '上传'}
                    </button>
                    {asset && (
                      <button type="button" onClick={() => removeMaterial(slot.id)}>
                        移除
                      </button>
                    )}
                  </div>
                </section>
              )
            })}
          </div>

          <div className="leaf-stack">
            <div className="leaf-stack-header">
              <div>
                <h3>内页叶片</h3>
                <p>
                  已放入 {assignedLeafCount} / {settings.leafCount} 张
                </p>
              </div>
              <button
                type="button"
                onClick={() => leavesInputRef.current?.click()}
              >
                批量添加
              </button>
            </div>

            <ol>
              {project.leaves.map((leaf, index) => {
                const asset = leaf.assetId ? assetMap.get(leaf.assetId) : undefined

                return (
                  <li className={asset ? 'is-filled' : ''} key={leaf.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div className="leaf-info">
                      <strong>叶片 {index + 1}</strong>
                      <em>{asset ? asset.name : '空槽'}</em>
                    </div>
                    <div className="leaf-actions">
                      <label>
                        {asset ? '替换' : '选择'}
                        <input
                          type="file"
                          accept={IMAGE_ACCEPT}
                          onChange={(event) => {
                            void handleLeafReplace(leaf.id, event.currentTarget.files)
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                      {asset && (
                        <button
                          type="button"
                          onClick={() => removeLeafAsset(leaf.id)}
                        >
                          移除
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
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
              <span>{assignedLeafCount} 张已放入</span>
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
              {leaves.map((leaf) => {
                const slot = project.leaves[leaf.index]
                const asset = slot?.assetId ? assetMap.get(slot.assetId) : undefined

                return (
                  <div
                    className={`leaf ${asset ? 'has-artwork' : ''}`}
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
                      {asset ? (
                        <img alt="" src={asset.previewUrl} />
                      ) : (
                        <span>{leaf.index + 1}</span>
                      )}
                    </div>
                  </div>
                )
              })}
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
            onClick={() => {
              setProject((current) =>
                updateProjectSettings(
                  current,
                  createWorkshopProject().settings,
                ) as RuntimeDraftProject,
              )
              setNotice('已恢复默认工艺参数。')
            }}
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
            {!frontAsset && (
              <p className="validation hint">正面长卷尚未上传</p>
            )}
            {!backAsset && <p className="validation hint">背面长卷尚未上传</p>}
            {missingLeafCount > 0 && (
              <p className="validation hint">还缺 {missingLeafCount} 张内页素材</p>
            )}
            {validation.errors.length === 0 &&
              validation.warnings.length === 0 &&
              frontAsset &&
              backAsset &&
              missingLeafCount === 0 && (
                <p className="validation ok">素材和参数可用于测试导出</p>
              )}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
