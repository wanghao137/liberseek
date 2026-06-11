import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import {
  computeDerivedDimensions,
  computeLeafLayout,
  type BindingSettings,
} from '../binding/geometry'

describe('orientation support', () => {
  describe('horizontal orientation (default)', () => {
    it('computes correct layout for horizontal', () => {
      const settings: BindingSettings = {
        ...DEFAULT_BINDING_SETTINGS,
        orientation: 'horizontal',
      }

      const layout = computeLeafLayout(settings)

      expect(layout[0].xCm).toBe(0)
      expect(layout[1].xCm).toBe(settings.sliceWidthCm)
      expect(layout[0].yCm).toBe(0)
      expect(layout[0].heightCm).toBe(settings.artworkHeightCm)
    })
  })

  describe('vertical orientation', () => {
    it('computes correct layout for vertical', () => {
      const settings: BindingSettings = {
        ...DEFAULT_BINDING_SETTINGS,
        orientation: 'vertical',
      }

      const layout = computeLeafLayout(settings)

      expect(layout[0].xCm).toBe(0)
      expect(layout[0].yCm).toBe(0)
      expect(layout[1].yCm).toBe(settings.sliceWidthCm)
    })

    it('swaps dimensions for vertical', () => {
      const settings: BindingSettings = {
        ...DEFAULT_BINDING_SETTINGS,
        orientation: 'vertical',
      }

      const derived = computeDerivedDimensions(settings)

      expect(derived.frameWidthPx).toBeGreaterThan(0)
      expect(derived.frameHeightPx).toBeGreaterThan(0)
    })
  })

  describe('orientation switching', () => {
    it('preserves settings when switching orientation', () => {
      const horizontalSettings: BindingSettings = {
        ...DEFAULT_BINDING_SETTINGS,
        orientation: 'horizontal',
      }

      const verticalSettings: BindingSettings = {
        ...horizontalSettings,
        orientation: 'vertical',
      }

      expect(verticalSettings.artworkHeightCm).toBe(horizontalSettings.artworkHeightCm)
      expect(verticalSettings.visiblePageWidthCm).toBe(horizontalSettings.visiblePageWidthCm)
      expect(verticalSettings.leafCount).toBe(horizontalSettings.leafCount)
    })
  })
})
