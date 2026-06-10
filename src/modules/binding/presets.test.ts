import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from './presets'

describe('binding presets', () => {
  it('uses the default dragon scale craft baseline from the spec', () => {
    expect(DEFAULT_BINDING_SETTINGS).toEqual({
      artworkHeightCm: 30,
      visiblePageWidthCm: 22,
      pasteWidthCm: 2,
      sliceWidthCm: 2,
      leafCount: 23,
      edgeStyle: 'straight',
      orientation: 'horizontal',
      dpi: 300,
    })
  })
})
