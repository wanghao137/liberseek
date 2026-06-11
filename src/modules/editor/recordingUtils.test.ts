import { describe, expect, it } from 'vitest'

import {
  isMediaRecorderSupported,
  getSupportedMimeType,
  formatDuration,
  type RecordingState,
} from './recordingUtils'

describe('recording utilities', () => {
  describe('isMediaRecorderSupported', () => {
    it('checks if MediaRecorder is supported', () => {
      const supported = isMediaRecorderSupported()
      expect(typeof supported).toBe('boolean')
    })
  })

  describe('getSupportedMimeType', () => {
    it('returns a supported mime type or null', () => {
      const mimeType = getSupportedMimeType()
      expect(mimeType === null || typeof mimeType === 'string').toBe(true)
    })
  })

  describe('formatDuration', () => {
    it('formats seconds to mm:ss', () => {
      expect(formatDuration(0)).toBe('00:00')
      expect(formatDuration(30)).toBe('00:30')
      expect(formatDuration(60)).toBe('01:00')
      expect(formatDuration(90)).toBe('01:30')
      expect(formatDuration(3600)).toBe('60:00')
    })
  })

  describe('RecordingState', () => {
    it('creates initial recording state', () => {
      const state: RecordingState = {
        isRecording: false,
        isPaused: false,
        duration: 0,
        mimeType: null,
      }

      expect(state.isRecording).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.duration).toBe(0)
    })
  })
})
