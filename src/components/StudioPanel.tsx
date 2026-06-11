import { useState, useCallback } from 'react'
import { ImageAdjustmentPanel } from '../components/ImageAdjustmentPanel'
import { ExportDialog } from '../components/ExportDialog'
import { FlipPreview } from '../components/FlipPreview'
import { ScrollPreview } from '../components/ScrollPreview'
import { TemplateSelector } from '../components/TemplateSelector'
import { WatermarkSettings } from '../components/WatermarkSettings'
import { DEFAULT_TRANSFORM, type TransformOptions } from '../modules/editor/transformUtils'
import { createExportProgress, type ExportProgress } from '../modules/export/exportProgress'

type StudioPanelProps = {
  project: any
  onProjectChange: (project: any) => void
}

export function StudioPanel({ project, onProjectChange }: StudioPanelProps) {
  const [showImageAdjustment, setShowImageAdjustment] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFlipPreview, setShowFlipPreview] = useState(false)
  const [showScrollPreview, setShowScrollPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showWatermarkSettings, setShowWatermarkSettings] = useState(false)
  const [transform, setTransform] = useState<TransformOptions>(DEFAULT_TRANSFORM)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [watermark, setWatermark] = useState('鳞卷工坊')
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.6)

  const handleTransformChange = useCallback((newTransform: TransformOptions) => {
    setTransform(newTransform)
  }, [])

  const handleTransformReset = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM)
  }, [])

  const handleExport = useCallback(async (type: 'image-package' | 'pdf-package' | 'readme') => {
    setIsExporting(true)
    setExportProgress(createExportProgress(type, 10))

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))

    setExportProgress(prev => prev ? { ...prev, status: 'complete', percentage: 100 } : null)
    setIsExporting(false)

    setTimeout(() => {
      setShowExportDialog(false)
      setExportProgress(null)
    }, 1000)
  }, [])

  const handleTemplateSelect = useCallback((newProject: any) => {
    onProjectChange(newProject)
    setShowTemplateSelector(false)
  }, [onProjectChange])

  return (
    <>
      <div className="studio-panels">
        <button
          type="button"
          className="panel-toggle"
          onClick={() => setShowImageAdjustment(!showImageAdjustment)}
        >
          🎨 图片调整
        </button>
        <button
          type="button"
          className="panel-toggle"
          onClick={() => setShowExportDialog(true)}
        >
          📥 导出
        </button>
        <button
          type="button"
          className="panel-toggle"
          onClick={() => setShowFlipPreview(true)}
        >
          📖 翻页预览
        </button>
        <button
          type="button"
          className="panel-toggle"
          onClick={() => setShowScrollPreview(true)}
        >
          📜 卷动预览
        </button>
        <button
          type="button"
          className="panel-toggle"
          onClick={() => setShowTemplateSelector(true)}
        >
          📋 模板
        </button>
        <button
          type="button"
          className="panel-toggle"
          onClick={() => setShowWatermarkSettings(!showWatermarkSettings)}
        >
          💧 水印
        </button>
      </div>

      {showImageAdjustment && (
        <ImageAdjustmentPanel
          transform={transform}
          onChange={handleTransformChange}
          onReset={handleTransformReset}
        />
      )}

      {showWatermarkSettings && (
        <WatermarkSettings
          watermark={watermark}
          onWatermarkChange={setWatermark}
          position={watermarkPosition}
          onPositionChange={setWatermarkPosition}
          opacity={watermarkOpacity}
          onOpacityChange={setWatermarkOpacity}
        />
      )}

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        progress={exportProgress}
        isExporting={isExporting}
      />

      {showFlipPreview && (
        <FlipPreview
          totalLeaves={project.leaves.length}
          leafImages={project.leaves.map((leaf: any) => ({
            id: leaf.id,
            url: leaf.imageUrl || null,
          }))}
          onClose={() => setShowFlipPreview(false)}
        />
      )}

      {showScrollPreview && (
        <ScrollPreview
          totalLeaves={project.leaves.length}
          leafImages={project.leaves.map((leaf: any) => ({
            id: leaf.id,
            url: leaf.imageUrl || null,
          }))}
          onClose={() => setShowScrollPreview(false)}
        />
      )}

      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      <style>{`
        .studio-panels {
          display: flex;
          gap: 8px;
          padding: 8px;
          background: var(--paper);
          border-bottom: 1px solid var(--line);
          flex-wrap: wrap;
        }

        .panel-toggle {
          padding: 6px 12px;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: var(--paper-bright);
          color: var(--ink);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .panel-toggle:hover {
          border-color: var(--jade);
          color: var(--jade);
          background: rgba(30, 111, 85, 0.05);
        }
      `}</style>
    </>
  )
}
