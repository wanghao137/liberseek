import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions } from '../binding/geometry'
import {
  createCalibrationPdf,
} from './pdfGenerator'

describe('PDF generator', () => {
  describe('createCalibrationPdf', () => {
    it('creates a calibration PDF', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)

      const pdfBlob = await createCalibrationPdf(settings, derived)

      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.type).toBe('application/pdf')
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    it('calibration PDF contains correct metadata', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)

      const pdfBlob = await createCalibrationPdf(settings, derived)
      const pdfData = await pdfBlob.arrayBuffer()
      
      const pdfBytes = new Uint8Array(pdfData)
      const pdfString = new TextDecoder().decode(pdfBytes)
      
      expect(pdfString).toContain('%PDF')
      expect(pdfString).toContain('jsPDF')
    })
  })
})
