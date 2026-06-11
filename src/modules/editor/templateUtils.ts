import type { BindingSettings } from '../binding/geometry'
import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { createWorkshopProject } from '../project/project'

export type Template = {
  id: string
  name: string
  description: string
  settings: Partial<BindingSettings>
  icon: string
}

const TEMPLATES: Template[] = [
  {
    id: 'ancient-scroll',
    name: '古籍长卷',
    description: '适合古典文学、诗词、书法作品的传统长卷格式',
    settings: {
      artworkHeightCm: 30,
      visiblePageWidthCm: 22,
      pasteWidthCm: 2,
      sliceWidthCm: 2,
      leafCount: 23,
      edgeStyle: 'straight',
    },
    icon: '📜',
  },
  {
    id: 'illustration集',
    name: '插画集',
    description: '适合现代插画、漫画、绘本的展示格式',
    settings: {
      artworkHeightCm: 25,
      visiblePageWidthCm: 20,
      pasteWidthCm: 1.5,
      sliceWidthCm: 1.5,
      leafCount: 20,
      edgeStyle: 'straight',
    },
    icon: '🎨',
  },
  {
    id: 'photo-sequence',
    name: '摄影序列',
    description: '适合摄影作品集、旅行照片的连续展示格式',
    settings: {
      artworkHeightCm: 20,
      visiblePageWidthCm: 30,
      pasteWidthCm: 2,
      sliceWidthCm: 2,
      leafCount: 15,
      edgeStyle: 'straight',
    },
    icon: '📷',
  },
  {
    id: 'teaching-demo',
    name: '教学演示',
    description: '适合教学材料、演示文稿的大尺寸格式',
    settings: {
      artworkHeightCm: 40,
      visiblePageWidthCm: 35,
      pasteWidthCm: 3,
      sliceWidthCm: 3,
      leafCount: 10,
      edgeStyle: 'straight',
    },
    icon: '📚',
  },
  {
    id: 'compact',
    name: '紧凑型',
    description: '适合小尺寸作品、名片、卡片的紧凑格式',
    settings: {
      artworkHeightCm: 15,
      visiblePageWidthCm: 10,
      pasteWidthCm: 1,
      sliceWidthCm: 1,
      leafCount: 30,
      edgeStyle: 'straight',
    },
    icon: '🃏',
  },
]

export function getTemplateList(): Template[] {
  return [...TEMPLATES]
}

export function getTemplate(id: string): Template | null {
  return TEMPLATES.find((t) => t.id === id) ?? null
}

export function createProjectFromTemplate(
  template: Template,
  title?: string,
): ReturnType<typeof createWorkshopProject> {
  const settings: BindingSettings = {
    ...DEFAULT_BINDING_SETTINGS,
    ...template.settings,
  }

  return createWorkshopProject({
    title: title ?? template.name,
    settings,
  })
}
