import { describe, expect, it } from 'vitest'

import {
  cmToPx,
  computeDerivedDimensions,
  computeLeafLayout,
  validateBindingSettings,
  type BindingSettings,
} from './geometry'

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

describe('binding geometry', () => {
  it('derives default dragon scale dimensions from physical settings', () => {
    expect(computeDerivedDimensions(defaultSettings)).toEqual({
      leafPhysicalWidthCm: 24,
      scrollArtworkLengthCm: 68,
      pageStructureCount: 24,
      frameWidthPx: 2835,
      frameHeightPx: 3543,
      scrollWidthPx: 8031,
      scrollHeightPx: 3543,
    })
  })

  it('places leaves using the slice width as the repeated offset', () => {
    const layout = computeLeafLayout({
      ...defaultSettings,
      leafCount: 3,
    })

    expect(layout).toEqual([
      {
        index: 0,
        xCm: 0,
        yCm: 0,
        widthCm: 24,
        heightCm: 30,
        pasteRect: { xCm: 0, yCm: 0, widthCm: 2, heightCm: 30 },
        visibleRect: { xCm: 2, yCm: 0, widthCm: 22, heightCm: 30 },
      },
      {
        index: 1,
        xCm: 2,
        yCm: 0,
        widthCm: 24,
        heightCm: 30,
        pasteRect: { xCm: 0, yCm: 0, widthCm: 2, heightCm: 30 },
        visibleRect: { xCm: 2, yCm: 0, widthCm: 22, heightCm: 30 },
      },
      {
        index: 2,
        xCm: 4,
        yCm: 0,
        widthCm: 24,
        heightCm: 30,
        pasteRect: { xCm: 0, yCm: 0, widthCm: 2, heightCm: 30 },
        visibleRect: { xCm: 2, yCm: 0, widthCm: 22, heightCm: 30 },
      },
    ])
  })

  it('converts centimeters to export pixels with explicit dpi', () => {
    expect(cmToPx(30, 300)).toBe(3543)
    expect(cmToPx(24, 300)).toBe(2835)
  })

  it('reports hard validation errors before export', () => {
    expect(
      validateBindingSettings({
        ...defaultSettings,
        sliceWidthCm: 0,
      }),
    ).toEqual({
      errors: ['sliceWidthCm must be greater than 0'],
      warnings: [],
    })
  })

  it('warns when the exposed slice is wider than the paste area', () => {
    expect(
      validateBindingSettings({
        ...defaultSettings,
        pasteWidthCm: 1,
        sliceWidthCm: 2,
      }),
    ).toEqual({
      errors: [],
      warnings: ['sliceWidthCm is greater than pasteWidthCm'],
    })
  })
})
