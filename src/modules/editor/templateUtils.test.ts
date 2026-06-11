import { describe, expect, it } from 'vitest'

import {
  getTemplate,
  getTemplateList,
  createProjectFromTemplate,
} from './templateUtils'

describe('template utilities', () => {
  describe('getTemplateList', () => {
    it('returns a list of available templates', () => {
      const templates = getTemplateList()

      expect(templates.length).toBeGreaterThan(0)
      expect(templates[0]).toHaveProperty('id')
      expect(templates[0]).toHaveProperty('name')
      expect(templates[0]).toHaveProperty('description')
    })
  })

  describe('getTemplate', () => {
    it('returns a template by id', () => {
      const template = getTemplate('ancient-scroll')

      expect(template).toBeDefined()
      expect(template?.id).toBe('ancient-scroll')
      expect(template?.name).toContain('古籍')
    })

    it('returns null for unknown id', () => {
      const template = getTemplate('unknown')

      expect(template).toBeNull()
    })
  })

  describe('createProjectFromTemplate', () => {
    it('creates a project from template', () => {
      const template = getTemplate('ancient-scroll')!
      const project = createProjectFromTemplate(template, '测试项目')

      expect(project).toBeDefined()
      expect(project.title).toBe('测试项目')
      expect(project.settings).toBeDefined()
      expect(project.settings.leafCount).toBeGreaterThan(0)
    })

    it('uses template title if no title provided', () => {
      const template = getTemplate('ancient-scroll')!
      const project = createProjectFromTemplate(template)

      expect(project.title).toBe(template.name)
    })
  })
})
