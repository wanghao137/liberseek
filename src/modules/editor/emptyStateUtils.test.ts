import { describe, expect, it } from 'vitest'

import {
  getEmptyStateMessage,
  getEmptyStateHint,
} from './emptyStateUtils'

describe('empty state utilities', () => {
  describe('getEmptyStateMessage', () => {
    it('returns message for no front scroll', () => {
      const message = getEmptyStateMessage('no-front')
      expect(message).toContain('正面长卷')
    })

    it('returns message for no back scroll', () => {
      const message = getEmptyStateMessage('no-back')
      expect(message).toContain('背面长卷')
    })

    it('returns message for no leaves', () => {
      const message = getEmptyStateMessage('no-leaves')
      expect(message).toContain('内页叶片')
    })

    it('returns message for empty project', () => {
      const message = getEmptyStateMessage('empty-project')
      expect(message).toContain('新项目')
    })
  })

  describe('getEmptyStateHint', () => {
    it('returns hint for no front scroll', () => {
      const hint = getEmptyStateHint('no-front')
      expect(hint).toContain('上传')
    })

    it('returns hint for no leaves', () => {
      const hint = getEmptyStateHint('no-leaves')
      expect(hint).toContain('批量')
    })
  })
})
