import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
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
  importDscalePackage,
  formatDscalePackageImportError,
} from './modules/project/dscalePackage'
import {
  clearActiveDraft,
  loadActiveDraft,
  saveActiveDraft,
  toRuntimeDraftProject,
  type RuntimeDraftAsset,
  type RuntimeDraftProject,
} from './modules/storage/draft'
import { ImageAdjustmentPanel } from './components/ImageAdjustmentPanel'
import { FlipPreview } from './components/FlipPreview'
import { ScrollPreview } from './components/ScrollPreview'
import { Preview3D } from './components/Preview3D'
import { PreviewMenu } from './components/PreviewMenu'
import { TemplateSelector } from './components/TemplateSelector'
import { WatermarkSettings } from './components/WatermarkSettings'
import { ZoomIndicator } from './components/ZoomIndicator'
import { QRCodeDisplay } from './components/QRCodeDisplay'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { DEFAULT_TRANSFORM, type TransformOptions } from './modules/editor/transformUtils'
import { exportImagePackage, exportPdfPackage, exportReadme } from './modules/export/exportFlow'

type NumericSettingKey = 'artworkHeightCm' | 'visiblePageWidthCm' | 'pasteWidthCm' | 'sliceWidthCm' | 'leafCount' | 'dpi'
type MaterialRole = Extract<ProjectAssetRole, 'front' | 'back'>
type PackageStatus = 'idle' | 'importing' | 'exporting'
type MaterialSlot = { id: MaterialRole; title: string; emptyMeta: string; loadedMeta: string }
type PreviewMode = 'flip' | '3d' | 'scroll' | null

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const PACKAGE_ACCEPT = '.dscale.zip,application/zip,application/x-zip-compressed'

const controls: Array<{ key: NumericSettingKey; label: string; min: number; max: number; step: number; unit: string }> = [
  { key: 'artworkHeightCm', label: '画心高度', min: 5, max: 80, step: 0.1, unit: '厘米' },
  { key: 'visiblePageWidthCm', label: '页面可视宽度', min: 5, max: 80, step: 0.1, unit: '厘米' },
  { key: 'pasteWidthCm', label: '粘贴宽度', min: 0.5, max: 10, step: 0.1, unit: '厘米' },
  { key: 'sliceWidthCm', label: '鳞片露出宽度', min: 0.5, max: 10, step: 0.1, unit: '厘米' },
  { key: 'leafCount', label: '叶片数量', min: 1, max: 80, step: 1, unit: '张' },
  { key: 'dpi', label: '导出精度', min: 72, max: 600, step: 1, unit: 'DPI' },
]

const materialSlots: MaterialSlot[] = [
  { id: 'front', title: '正面长卷', emptyMeta: '展开时显示', loadedMeta: '正面长卷已载入' },
  { id: 'back', title: '背面长卷', emptyMeta: '收卷时参考', loadedMeta: '背面长卷已载入' },
]

const edgeStyleLabels: Record<BindingSettings['edgeStyle'], string> = { straight: '直边', wave: '波浪', sawtooth: '锯齿' }

function createRuntimeProject(): RuntimeDraftProject { return createWorkshopProject() as RuntimeDraftProject }
function formatCm(value: number) { return `${Number(value.toFixed(2))} 厘米` }
function formatPixels(asset: RuntimeDraftAsset) { return asset.widthPx === null || asset.heightPx === null ? '尺寸待识别' : `${asset.widthPx} x ${asset.heightPx}px` }
function createAssetId(role: ProjectAssetRole) { return `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }
function readImageSize(previewUrl: string): Promise<{ widthPx: number | null; heightPx: number | null }> { return new Promise((resolve) => { const image = new Image(); image.onload = () => resolve({ widthPx: image.naturalWidth, heightPx: image.naturalHeight }); image.onerror = () => resolve({ widthPx: null, heightPx: null }); image.src = previewUrl }) }
function getImageFiles(files: FileList | null): File[] { return Array.from(files ?? []).filter((file) => file.type.startsWith('image/')) }

function App() {
  const [project, setProject] = useState<RuntimeDraftProject>(() => createRuntimeProject())
  const [notice, setNotice] = useState('正在检查本地草稿。')
  const [saveStatus, setSaveStatus] = useState('尚未保存')
  const [packageStatus, setPackageStatus] = useState<PackageStatus>('idle')
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const leavesInputRef = useRef<HTMLInputElement>(null)
  const packageInputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const draftReadyRef = useRef(false)
  const autoSaveTimerRef = useRef<number | undefined>(undefined)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const settings = project.settings
  const derived = useMemo(() => computeDerivedDimensions(settings), [settings])
  const leaves = useMemo(() => computeLeafLayout(settings), [settings])
  const validation = useMemo(() => validateBindingSettings(settings), [settings])
  const assetMap = useMemo(() => new Map(project.assets.map((asset) => [asset.id, asset])), [project.assets])
  const frontAsset = project.assets.find((asset) => asset.role === 'front')
  const backAsset = project.assets.find((asset) => asset.role === 'back')
  const assignedLeafCount = project.leaves.filter((leaf) => leaf.assetId).length
  const missingLeafCount = Math.max(0, settings.leafCount - assignedLeafCount)

  const previewScale = 6
  const previewWidth = derived.scrollArtworkLengthCm * previewScale
  const previewHeight = settings.artworkHeightCm * previewScale

  // UI states
  const [showImageAdjustment, setShowImageAdjustment] = useState(false)
  const [showPreviewMenu, setShowPreviewMenu] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showWatermarkSettings, setShowWatermarkSettings] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [transform, setTransform] = useState<TransformOptions>(DEFAULT_TRANSFORM)
  const [isExporting, setIsExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState('')
  const [watermark, setWatermark] = useState('鳞卷工坊')
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.6)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingTimerRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const canvasInteraction = useCanvasInteraction()

  // Cleanup
  useEffect(() => {
    const objectUrls = objectUrlsRef.current
    return () => {
      if (autoSaveTimerRef.current !== undefined) window.clearTimeout(autoSaveTimerRef.current)
      if (recordingTimerRef.current !== null) window.clearInterval(recordingTimerRef.current)
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
      objectUrls.clear()
    }
  }, [])

  // Load draft
  useEffect(() => {
    let cancelled = false
    void loadActiveDraft().then((storedProject) => {
      if (cancelled) return
      if (!storedProject) { setNotice('未发现本地草稿，已创建新项目。'); setSaveStatus('等待首次自动保存'); return }
      const restored = toRuntimeDraftProject(storedProject, (blob) => { const previewUrl = URL.createObjectURL(blob); objectUrlsRef.current.add(previewUrl); return previewUrl })
      setProject(restored); setNotice('已恢复本地草稿。'); setSaveStatus('已从本地恢复')
    }).catch(() => { if (!cancelled) { setNotice('本地草稿读取失败，已进入新项目。'); setSaveStatus('读取失败') } }).finally(() => { if (!cancelled) draftReadyRef.current = true })
    return () => { cancelled = true }
  }, [])

  // Auto save
  useEffect(() => {
    if (!draftReadyRef.current) return
    if (autoSaveTimerRef.current !== undefined) window.clearTimeout(autoSaveTimerRef.current)
    setSaveStatus('正在自动保存...')
    autoSaveTimerRef.current = window.setTimeout(() => { void saveActiveDraft(project).then(() => setSaveStatus(`已自动保存 ${new Date().toLocaleTimeString('zh-CN')}`)).catch(() => setSaveStatus('自动保存失败')) }, 450)
    return () => { if (autoSaveTimerRef.current !== undefined) window.clearTimeout(autoSaveTimerRef.current) }
  }, [project])

  // Asset helpers
  async function createRuntimeAsset(file: File, role: ProjectAssetRole): Promise<RuntimeDraftAsset> { const previewUrl = URL.createObjectURL(file); objectUrlsRef.current.add(previewUrl); const size = await readImageSize(previewUrl); return { id: createAssetId(role), role, name: file.name, mimeType: file.type || 'application/octet-stream', widthPx: size.widthPx, heightPx: size.heightPx, blob: file, previewUrl } }
  function revokeAsset(asset: RuntimeDraftAsset) { URL.revokeObjectURL(asset.previewUrl); objectUrlsRef.current.delete(asset.previewUrl) }
  function createPreviewUrl(blob: Blob) { const previewUrl = URL.createObjectURL(blob); objectUrlsRef.current.add(previewUrl); return previewUrl }

  async function persistNow(message = '已保存到本地草稿。') { setSaveStatus('正在保存...'); try { await saveActiveDraft(project); setSaveStatus(`${message} ${new Date().toLocaleTimeString('zh-CN')}`) } catch { setSaveStatus('保存失败') } }

  // Export
  async function handleExport(type: 'image-package' | 'pdf-package' | 'readme') {
    setIsExporting(true); setExportNotice('正在导出...')
    const frameBlobs = project.leaves.map(leaf => leaf.assetId ? assetMap.get(leaf.assetId)?.blob : null).filter((b): b is Blob => b !== null)
    const input = { projectTitle: project.title, settings, derived, frameBlobs, frameImages: frameBlobs, frontScrollBlob: frontAsset?.blob ?? null, backScrollBlob: backAsset?.blob ?? null }
    try {
      let result: { success: boolean; blob: Blob | null; filename: string; error: string | null }
      if (type === 'image-package') result = await exportImagePackage(input)
      else if (type === 'pdf-package') result = await exportPdfPackage(input)
      else result = await exportReadme(input)
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob)
        const a = document.createElement('a'); a.href = url; a.download = result.filename; document.body.append(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 0)
        setExportNotice(`✅ ${result.filename} 导出成功`)
      } else {
        setExportNotice(`❌ ${result.error || '导出失败'}`)
      }
    } catch (e: any) { setExportNotice(`❌ 导出失败: ${e.message}`) }
    setIsExporting(false)
    setTimeout(() => setExportNotice(''), 5000)
  }

  // Recording
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) { setExportNotice('❌ 无法找到画布元素'); return }
    try {
      const stream = canvas.captureStream(30)
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 2500000 })
      recordedChunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `录制-${Date.now()}.webm`; document.body.append(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 0)
        setExportNotice('✅ 录制文件已下载')
        setTimeout(() => setExportNotice(''), 3000)
      }
      recorder.start(100)
      mediaRecorderRef.current = recorder
      setIsRecording(true); setRecordingDuration(0)
      recordingTimerRef.current = window.setInterval(() => setRecordingDuration(p => p + 1), 1000)
    } catch (e: any) { setExportNotice(`❌ 录制失败: ${e.message}`) }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop()
    if (recordingTimerRef.current !== null) { window.clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }
    setIsRecording(false)
  }, [])

  // Project operations
  async function handleNewProject() { if (!window.confirm('新建项目会清空当前素材，是否继续？')) return; project.assets.forEach(revokeAsset); const p = createRuntimeProject(); setProject(p); setNotice('已新建项目。'); await clearActiveDraft(); await saveActiveDraft(p) }
  function updateNumber(key: NumericSettingKey, value: string) { const parsed = Number(value); if (!Number.isFinite(parsed)) return; const next = key === 'leafCount' || key === 'dpi' ? Math.round(parsed) : parsed; setProject((c) => { const r = updateProjectSettings(c, { [key]: next }) as RuntimeDraftProject; const live = new Set(r.leaves.map(l => l.assetId).filter((id): id is string => id !== null)); const removed = r.assets.filter(a => a.role === 'leaf' && !live.has(a.id)); removed.forEach(revokeAsset); return { ...r, assets: r.assets.filter(a => a.role !== 'leaf' || live.has(a.id)) } }) }
  async function handleMaterialUpload(role: MaterialRole, files: FileList | null) { const [file] = getImageFiles(files); if (!file) return; const asset = await createRuntimeAsset(file, role); setProject(c => { const removed = c.assets.filter(i => i.role === role); removed.forEach(revokeAsset); return { ...c, updatedAt: new Date().toISOString(), assets: [...c.assets.filter(i => i.role !== role), asset] } }); setNotice(`${role === 'front' ? '正面长卷' : '背面长卷'}已载入：${file.name}`) }
  async function handleLeafBatchUpload(files: FileList | null) { const imageFiles = getImageFiles(files); if (!imageFiles.length) return; const assets = await Promise.all(imageFiles.map(f => createRuntimeAsset(f, 'leaf'))); setProject(c => { const first = c.leaves.findIndex(l => !l.assetId); const start = first === -1 ? c.leaves.length : first; const needed = start + assets.length; const base = needed > c.leaves.length ? updateProjectSettings(c, { leafCount: needed }) as RuntimeDraftProject : c; const leaves = base.leaves.map(l => ({ ...l })); assets.forEach((a, i) => { leaves[start + i] = { ...leaves[start + i], assetId: a.id } }); return { ...base, updatedAt: new Date().toISOString(), assets: [...base.assets, ...assets], leaves } }); setNotice(`已添加 ${assets.length} 张内页素材。`) }
  async function handleLeafReplace(leafId: string, files: FileList | null) { const [file] = getImageFiles(files); if (!file) return; const asset = await createRuntimeAsset(file, 'leaf'); setProject(c => { const leaf = c.leaves.find(l => l.id === leafId); const removed = leaf?.assetId ? c.assets.find(a => a.id === leaf.assetId) : undefined; if (removed) revokeAsset(removed); return { ...c, updatedAt: new Date().toISOString(), assets: [...c.assets.filter(a => a.id !== leaf?.assetId), asset], leaves: c.leaves.map(l => l.id === leafId ? { ...l, assetId: asset.id } : l) } }) }
  function removeMaterial(role: MaterialRole) { setProject(c => { const removed = c.assets.filter(a => a.role === role); removed.forEach(revokeAsset); return { ...c, updatedAt: new Date().toISOString(), assets: c.assets.filter(a => a.role !== role) } }) }
  function removeLeafAsset(leafId: string) { setProject(c => { const leaf = c.leaves.find(l => l.id === leafId); const removed = leaf?.assetId ? c.assets.find(a => a.id === leaf.assetId) : undefined; if (removed) revokeAsset(removed); return { ...c, updatedAt: new Date().toISOString(), assets: c.assets.filter(a => a.id !== leaf?.assetId), leaves: c.leaves.map(l => l.id === leafId ? { ...l, assetId: null } : l) } }) }
  async function handleImportPackage(files: FileList | null) { const [file] = Array.from(files ?? []); if (!file) return; setPackageStatus('importing'); try { const imported = await importDscalePackage(file); const runtime = toRuntimeDraftProject(imported, createPreviewUrl); project.assets.forEach(revokeAsset); setProject(runtime); await saveActiveDraft(runtime); setNotice(`已导入：${file.name}`) } catch (e) { setNotice(formatDscalePackageImportError(e)) } finally { setPackageStatus('idle') } }
  function handleTemplateSelect(newProject: any) { setProject(newProject as RuntimeDraftProject); setShowTemplateSelector(false); setNotice('已应用模板') }

  // Get leaf images for preview
  const leafImages = useMemo(() => project.leaves.map(l => ({ id: l.id, url: l.assetId ? assetMap.get(l.assetId)?.previewUrl || null : null })), [project.leaves, assetMap])

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="seal-mark">鳞</span>
          <div><p className="eyebrow">LiberSeek 非遗装帧实验室</p><h1>鳞卷工坊</h1></div>
        </div>
        <nav className="toolbar">
          <button onClick={() => void handleNewProject()}>新建</button>
          <button onClick={() => packageInputRef.current?.click()}>{packageStatus === 'importing' ? '导入中...' : '导入'}</button>
          <button onClick={() => void persistNow()}>保存</button>
          <button onClick={() => void handleExport('image-package')}>{isExporting ? '导出中...' : '导出'}</button>
          <button onClick={() => setShowPreviewMenu(true)}>预览</button>
          <button onClick={() => setShowImageAdjustment(!showImageAdjustment)}>调整</button>
          <button onClick={() => setShowTemplateSelector(true)}>模板</button>
          <button onClick={() => setShowWatermarkSettings(!showWatermarkSettings)}>水印</button>
          <button onClick={() => setShowQRCode(!showQRCode)}>QR码</button>
          <button onClick={() => void handleExport('pdf-package')}>PDF</button>
          <button onClick={() => void handleExport('readme')}>README</button>
        </nav>
      </header>

      <input ref={packageInputRef} className="hidden-input" type="file" accept={PACKAGE_ACCEPT} onChange={(e) => { void handleImportPackage(e.currentTarget.files); e.currentTarget.value = '' }} />
      <input ref={frontInputRef} className="hidden-input" type="file" accept={IMAGE_ACCEPT} onChange={(e) => { void handleMaterialUpload('front', e.currentTarget.files); e.currentTarget.value = '' }} />
      <input ref={backInputRef} className="hidden-input" type="file" accept={IMAGE_ACCEPT} onChange={(e) => { void handleMaterialUpload('back', e.currentTarget.files); e.currentTarget.value = '' }} />
      <input ref={leavesInputRef} className="hidden-input" type="file" accept={IMAGE_ACCEPT} multiple onChange={(e) => { void handleLeafBatchUpload(e.currentTarget.files); e.currentTarget.value = '' }} />

      {exportNotice && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: 8, background: exportNotice.startsWith('✅') ? '#1e6f55' : '#a33a2b', color: '#fff', fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>{exportNotice}</div>}

      <section className="workspace">
        <aside className="side-panel material-panel">
          <div className="panel-title">
            <p className="eyebrow">素材</p><h2>长卷与叶片</h2>
            <p className="panel-note">{notice}</p>
            <p className="save-status">{saveStatus}</p>
          </div>
          <div className="material-list">
            {materialSlots.map((slot) => {
              const asset = slot.id === 'front' ? frontAsset : backAsset
              return (
                <section key={slot.id} className={`material-row ${asset ? 'is-loaded' : ''}`}>
                  <div className="slot-thumb">{asset && <img alt="" src={asset.previewUrl} />}</div>
                  <div className="material-body"><h3>{slot.title}</h3><p>{asset ? asset.name : slot.emptyMeta}</p><small>{asset ? formatPixels(asset) : '未上传'}</small></div>
                  <div className="material-actions">
                    <button onClick={() => slot.id === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()}>{asset ? '替换' : '上传'}</button>
                    {asset && <button onClick={() => removeMaterial(slot.id)}>移除</button>}
                  </div>
                </section>
              )
            })}
          </div>
          <div className="leaf-stack">
            <div className="leaf-stack-header"><div><h3>内页叶片</h3><p>已放入 {assignedLeafCount} / {settings.leafCount} 张</p></div><button onClick={() => leavesInputRef.current?.click()}>批量添加</button></div>
            <ol>{project.leaves.map((leaf, index) => { const asset = leaf.assetId ? assetMap.get(leaf.assetId) : undefined; return (<li key={leaf.id} className={asset ? 'is-filled' : ''}><span>{String(index + 1).padStart(2, '0')}</span><div className="leaf-info"><strong>叶片 {index + 1}</strong><em>{asset ? asset.name : '空槽'}</em></div><div className="leaf-actions"><label>{asset ? '替换' : '选择'}<input type="file" accept={IMAGE_ACCEPT} onChange={(e) => { void handleLeafReplace(leaf.id, e.currentTarget.files); e.currentTarget.value = '' }} /></label>{asset && <button onClick={() => removeLeafAsset(leaf.id)}>移除</button>}</div></li>) })}</ol>
          </div>
          {showImageAdjustment && <ImageAdjustmentPanel transform={transform} onChange={setTransform} onReset={() => setTransform(DEFAULT_TRANSFORM)} />}
          {showWatermarkSettings && <WatermarkSettings watermark={watermark} onWatermarkChange={setWatermark} position={watermarkPosition} onPositionChange={setWatermarkPosition} opacity={watermarkOpacity} onOpacityChange={setWatermarkOpacity} />}
          {showQRCode && <QRCodeDisplay projectTitle={project.title} artworkHeightCm={settings.artworkHeightCm} visiblePageWidthCm={settings.visiblePageWidthCm} leafCount={settings.leafCount} />}
        </aside>

        <section className="canvas-panel">
          <div className="canvas-header"><div><p className="eyebrow">二维装帧画布</p><h2>龙鳞排布</h2></div><div className="canvas-meta"><span>{edgeStyleLabels[settings.edgeStyle]}</span><span>{settings.leafCount} 张叶片</span><span>{assignedLeafCount} 张已放入</span></div></div>
          <div className="scroll-stage" onWheel={canvasInteraction.handleWheel} onMouseDown={canvasInteraction.handleMouseDown} onMouseMove={canvasInteraction.handleMouseMove} onMouseUp={canvasInteraction.handleMouseUp} onDoubleClick={canvasInteraction.handleDoubleClick}>
            <div className="scroll-base" style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, transform: `scale(${canvasInteraction.viewState.scale}) translate(${canvasInteraction.viewState.offsetX}px, ${canvasInteraction.viewState.offsetY}px)` }}>
              <canvas ref={canvasRef} width={Math.round(previewWidth)} height={Math.round(previewHeight)} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0 }} />
              <div className="ruler horizontal-ruler" /><div className="ruler vertical-ruler" />
              {leaves.map((leaf) => { const slot = project.leaves[leaf.index]; const asset = slot?.assetId ? assetMap.get(slot.assetId) : undefined; return (<div key={leaf.index} className={`leaf ${asset ? 'has-artwork' : ''}`} style={{ width: `${leaf.widthCm * previewScale}px`, height: `${leaf.heightCm * previewScale}px`, transform: `translateX(${leaf.xCm * previewScale}px)`, zIndex: leaf.index + 1 }}><div className="paste-zone" style={{ width: `${leaf.pasteRect.widthCm * previewScale}px` }} /><div className="visible-zone">{asset ? <img alt="" src={asset.previewUrl} /> : <span>{leaf.index + 1}</span>}</div></div>) })}
            </div>
            <ZoomIndicator scale={canvasInteraction.viewState.scale} onReset={canvasInteraction.reset} />
          </div>
          {/* Recording controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#1a1a1a', borderRadius: 8, margin: '0 16px 16px' }}>
            <span style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 14 }}>{formatDuration(recordingDuration)}</span>
            {!isRecording ? (
              <button onClick={startRecording} style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: '#ff4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>● 开始录制</button>
            ) : (
              <button onClick={stopRecording} style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: '#666', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>■ 停止录制</button>
            )}
            {isRecording && <span style={{ color: '#ff4444', fontSize: 13, fontWeight: 600 }}><span style={{ display: 'inline-block', width: 8, height: 8, background: '#ff4444', borderRadius: '50%', marginRight: 6, animation: 'pulse 1s infinite' }} />录制中</span>}
          </div>
        </section>

        <aside className="side-panel inspector-panel">
          <div className="panel-title"><p className="eyebrow">参数</p><h2>装帧设置</h2></div>
          <div className="control-list">{controls.map((c) => (<label className="number-control" key={c.key}><span>{c.label}</span><div className="input-row"><input type="number" min={c.min} max={c.max} step={c.step} value={settings[c.key]} onChange={(e) => updateNumber(c.key, e.target.value)} /><strong>{c.unit}</strong></div></label>))}</div>
          <button className="reset-button" onClick={() => setProject(c => updateProjectSettings(c, createWorkshopProject().settings) as RuntimeDraftProject)}>恢复默认预设</button>
          <dl className="metrics">
            <div><dt>叶片物理宽度</dt><dd>{formatCm(derived.leafPhysicalWidthCm)}</dd></div>
            <div><dt>长卷画心长度</dt><dd>{formatCm(derived.scrollArtworkLengthCm)}</dd></div>
            <div><dt>页面结构数</dt><dd>{derived.pageStructureCount}</dd></div>
            <div><dt>单张叶片像素</dt><dd>{derived.frameWidthPx} x {derived.frameHeightPx}</dd></div>
            <div><dt>长卷像素</dt><dd>{derived.scrollWidthPx} x {derived.scrollHeightPx}</dd></div>
          </dl>
          <div className="validation-list">
            {validation.errors.map((m) => <p className="validation error" key={m}>{m}</p>)}
            {validation.warnings.map((m) => <p className="validation warning" key={m}>{m}</p>)}
            {!frontAsset && <p className="validation hint">正面长卷尚未上传</p>}
            {!backAsset && <p className="validation hint">背面长卷尚未上传</p>}
            {missingLeafCount > 0 && <p className="validation hint">还缺 {missingLeafCount} 张内页素材</p>}
            {validation.errors.length === 0 && validation.warnings.length === 0 && frontAsset && backAsset && missingLeafCount === 0 && <p className="validation ok">素材和参数可用于测试导出</p>}
          </div>
        </aside>
      </section>

      {/* Modals */}
      {showPreviewMenu && <PreviewMenu onSelect={(mode) => { setShowPreviewMenu(false); setPreviewMode(mode) }} onClose={() => setShowPreviewMenu(false)} />}
      {previewMode === 'flip' && <FlipPreview totalLeaves={project.leaves.length} leafImages={leafImages} onClose={() => setPreviewMode(null)} />}
      {previewMode === '3d' && <Preview3D leafImages={leafImages} onClose={() => setPreviewMode(null)} />}
      {previewMode === 'scroll' && <ScrollPreview totalLeaves={project.leaves.length} leafImages={leafImages} onClose={() => setPreviewMode(null)} />}
      {showTemplateSelector && <TemplateSelector onSelect={handleTemplateSelect} onClose={() => setShowTemplateSelector(false)} />}
    </main>
  )
}

export default App
