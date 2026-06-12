import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions, type BindingSettings } from '../binding/geometry'

describe('margin settings', () => {
  it('computes dimensions with default margins', () => {
    const settings: BindingSettings = {
      ...DEFAULT_BINDING_SETTINGS,
      marginStartCm: 0,
      marginEndCm: 0,
      marginTopCm: 0,
      marginBottomCm: 0,
    }

    const derived = computeDerivedDimensions(settings)

    expect(derived.scrollWidthPx).toBeGreaterThan(0)
    expect(derived.scrollHeightPx).toBeGreaterThan(0)
  })

  it('computes dimensions with custom margins', () => {
    const settings: BindingSettings = {
      ...DEFAULT_BINDING_SETTINGS,
      marginStartCm: 2,
      marginEndCm: 2,
      marginTopCm: 1,
      marginBottomCm: 1,
    }

    const derived = computeDerivedDimensions(settings)

    expect(derived.scrollWidthPx).toBeGreaterThan(0)
    expect(derived.scrollHeightPx).toBeGreaterThan(0)
  })

  it('includes margins in scroll dimensions', () => {
    const settingsNoMargin: BindingSettings = {
      ...DEFAULT_BINDING_SETTINGS,
      marginStartCm: 0,
      marginEndCm: 0,
      marginTopCm: 0,
      marginBottomCm: 0,
    }

    const settingsWithMargin: BindingSettings = {
      ...DEFAULT_BINDING_SETTINGS,
      marginStartCm: 2,
      marginEndCm: 2,
      marginTopCm: 1,
      marginBottomCm: 1,
    }

    const derivedNoMargin = computeDerivedDimensions(settingsNoMargin)
    const derivedWithMargin = computeDerivedDimensions(settingsWithMargin)

    expect(derivedWithMargin.scrollWidthPx).toBeGreaterThan(derivedNoMargin.scrollWidthPx)
    expect(derivedWithMargin.scrollHeightPx).toBeGreaterThan(derivedNoMargin.scrollHeightPx)
  })
})
