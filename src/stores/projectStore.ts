import { create } from 'zustand'
import type { BindingSettings } from '../modules/binding/geometry'
import { DEFAULT_TRANSFORM, type TransformOptions } from '../modules/editor/transformUtils'
import { createWorkshopProject } from '../modules/project/project'

type ProjectState = {
  project: ReturnType<typeof createWorkshopProject>
  selectedLeafIndex: number | null
  transform: TransformOptions
  viewState: {
    scale: number
    offsetX: number
    offsetY: number
  }
  watermark: string
  watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  watermarkOpacity: number
  previewMode: 'edit' | 'flip' | 'scroll'
  isLoading: boolean
}

type ProjectActions = {
  setProject: (project: ReturnType<typeof createWorkshopProject>) => void
  updateSettings: (settings: Partial<BindingSettings>) => void
  setSelectedLeafIndex: (index: number | null) => void
  setTransform: (transform: TransformOptions) => void
  resetTransform: () => void
  setViewState: (viewState: Partial<ProjectState['viewState']>) => void
  resetViewState: () => void
  setWatermark: (watermark: string) => void
  setWatermarkPosition: (position: ProjectState['watermarkPosition']) => void
  setWatermarkOpacity: (opacity: number) => void
  setPreviewMode: (mode: ProjectState['previewMode']) => void
  setIsLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  project: createWorkshopProject(),
  selectedLeafIndex: null,
  transform: DEFAULT_TRANSFORM,
  viewState: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },
  watermark: '鳞卷工坊',
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 0.6,
  previewMode: 'edit',
  isLoading: false,

  setProject: (project) => set({ project }),

  updateSettings: (settings) =>
    set((state) => ({
      project: {
        ...state.project,
        settings: { ...state.project.settings, ...settings },
      },
    })),

  setSelectedLeafIndex: (index) => set({ selectedLeafIndex: index }),

  setTransform: (transform) => set({ transform }),

  resetTransform: () => set({ transform: DEFAULT_TRANSFORM }),

  setViewState: (viewState) =>
    set((state) => ({
      viewState: { ...state.viewState, ...viewState },
    })),

  resetViewState: () =>
    set({
      viewState: { scale: 1, offsetX: 0, offsetY: 0 },
    }),

  setWatermark: (watermark) => set({ watermark }),

  setWatermarkPosition: (position) => set({ watermarkPosition: position }),

  setWatermarkOpacity: (opacity) => set({ watermarkOpacity: opacity }),

  setPreviewMode: (mode) => set({ previewMode: mode }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}))
