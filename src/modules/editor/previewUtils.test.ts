import { describe, expect, it } from 'vitest'

import {
  createPreviewState,
  nextPage,
  previousPage,
  goToPage,
  formatPageIndicator,
} from './previewUtils'

describe('preview utilities', () => {
  describe('createPreviewState', () => {
    it('creates initial preview state', () => {
      const state = createPreviewState(10)

      expect(state.currentPage).toBe(0)
      expect(state.totalPages).toBe(10)
      expect(state.mode).toBe('edit')
    })
  })

  describe('nextPage', () => {
    it('advances to next page', () => {
      const state = createPreviewState(10)
      const next = nextPage(state)

      expect(next.currentPage).toBe(1)
    })

    it('does not exceed total pages', () => {
      const state = createPreviewState(3)
      let current = state

      current = nextPage(current)
      current = nextPage(current)
      current = nextPage(current)

      expect(current.currentPage).toBe(2)

      const still = nextPage(current)
      expect(still.currentPage).toBe(2)
    })
  })

  describe('previousPage', () => {
    it('goes to previous page', () => {
      const state = createPreviewState(10)
      const next = nextPage(state)
      const prev = previousPage(next)

      expect(prev.currentPage).toBe(0)
    })

    it('does not go below 0', () => {
      const state = createPreviewState(10)
      const prev = previousPage(state)

      expect(prev.currentPage).toBe(0)
    })
  })

  describe('goToPage', () => {
    it('goes to specific page', () => {
      const state = createPreviewState(10)
      const goTo = goToPage(state, 5)

      expect(goTo.currentPage).toBe(5)
    })

    it('constrains to valid range', () => {
      const state = createPreviewState(10)

      expect(goToPage(state, -1).currentPage).toBe(0)
      expect(goToPage(state, 15).currentPage).toBe(9)
    })
  })

  describe('formatPageIndicator', () => {
    it('formats page indicator', () => {
      const state = createPreviewState(10)
      expect(formatPageIndicator(state)).toBe('1 / 10')

      const next = nextPage(state)
      expect(formatPageIndicator(next)).toBe('2 / 10')
    })
  })
})
