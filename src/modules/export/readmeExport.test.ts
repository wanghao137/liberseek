import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import {
  generateReadmeContent,
  validateReadmeExport,
} from './readmeExport'

describe('readme export', () => {
  describe('generateReadmeContent', () => {
    it('generates Chinese README with all required sections', () => {
      const content = generateReadmeContent({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
        exportedAt: '2026-06-11T00:00:00.000Z',
      })

      expect(content).toContain('项目')
      expect(content).toContain('项目名称：测试项目')
      expect(content).toContain('导出日期：2026-06-11T00:00:00.000Z')
      expect(content).toContain('参数')
      expect(content).toContain('画心高度：30 厘米')
      expect(content).toContain('页面可视宽度：22 厘米')
      expect(content).toContain('粘贴宽度：2 厘米')
      expect(content).toContain('鳞片露出宽度：2 厘米')
      expect(content).toContain('叶片数量：23 张')
      expect(content).toContain('页面结构数：24')
      expect(content).toContain('边缘样式：直边')
      expect(content).toContain('导出精度：300 DPI')
    })

    it('includes derived dimensions', () => {
      const content = generateReadmeContent({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
      })

      expect(content).toContain('派生尺寸')
      expect(content).toContain('叶片物理宽度：24 厘米')
      expect(content).toContain('长卷画心长度：68 厘米')
      expect(content).toContain('单张叶片像素：2835 x 3543')
      expect(content).toContain('长卷像素：8031 x 3543')
    })

    it('lists all frame files', () => {
      const content = generateReadmeContent({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
      })

      expect(content).toContain('frames/')
      expect(content).toContain('frame_001.png')
      expect(content).toContain('frame_023.png')
      expect(content).toContain('scroll/')
      expect(content).toContain('front_full.png')
      expect(content).toContain('back_full.png')
    })

    it('includes assembly instructions', () => {
      const content = generateReadmeContent({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
      })

      expect(content).toContain('组装顺序')
      expect(content).toContain('按文件名顺序打印 frame 文件')
      expect(content).toContain('先贴 frame_001')
      expect(content).toContain('每张后续叶片按鳞片露出宽度')
      expect(content).toContain('只在粘贴区')
    })

    it('includes warnings and print settings', () => {
      const content = generateReadmeContent({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
      })

      expect(content).toContain('打印设置')
      expect(content).toContain('打印缩放保持 100%')
      expect(content).toContain('警告')
      expect(content).toContain('请勿使用缩放打印')
    })

    it('handles different edge styles', () => {
      const waveContent = generateReadmeContent({
        projectTitle: '测试项目',
        settings: { ...DEFAULT_BINDING_SETTINGS, edgeStyle: 'wave' },
      })

      expect(waveContent).toContain('边缘样式：波浪')

      const sawtoothContent = generateReadmeContent({
        projectTitle: '测试项目',
        settings: { ...DEFAULT_BINDING_SETTINGS, edgeStyle: 'sawtooth' },
      })

      expect(sawtoothContent).toContain('边缘样式：锯齿')
    })
  })

  describe('validateReadmeExport', () => {
    it('returns no warnings when all assets are present', () => {
      const warnings = validateReadmeExport(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: true,
        leaves: 23,
      })

      expect(warnings).toEqual([])
    })

    it('warns when front scroll is missing', () => {
      const warnings = validateReadmeExport(DEFAULT_BINDING_SETTINGS, {
        front: false,
        back: true,
        leaves: 23,
      })

      expect(warnings).toContain('正面长卷尚未上传')
    })

    it('warns when back scroll is missing', () => {
      const warnings = validateReadmeExport(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: false,
        leaves: 23,
      })

      expect(warnings).toContain('背面长卷尚未上传')
    })

    it('warns when leaf count is insufficient', () => {
      const warnings = validateReadmeExport(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: true,
        leaves: 10,
      })

      expect(warnings).toContain('内页素材不足：已上传 10 张，需要 23 张')
    })
  })
})
