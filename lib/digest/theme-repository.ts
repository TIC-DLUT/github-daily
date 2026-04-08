import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { emailThemes } from '../db/schema'
import { DEFAULT_TEMPLATE, DEFAULT_CONTENT_TEMPLATE } from '../email/default-template'

export interface ActiveTemplates {
  template: string
  contentTemplate: string
}

export function getActiveTemplates(): ActiveTemplates {
  const db = getDb()
  const theme = db
    .select()
    .from(emailThemes)
    .where(eq(emailThemes.isActive, 1))
    .get()

  return {
    template: theme?.template || DEFAULT_TEMPLATE,
    contentTemplate: theme?.contentTemplate || DEFAULT_CONTENT_TEMPLATE,
  }
}

export function listThemes() {
  const db = getDb()
  return db.select().from(emailThemes).all()
}

export function createTheme(
  name: string,
  template: string,
  contentTemplate: string,
  activate = false
) {
  const db = getDb()
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const now = Date.now()

  if (activate) {
    db.update(emailThemes).set({ isActive: 0 }).run()
  }

  db.insert(emailThemes)
    .values({
      id,
      name,
      isActive: activate ? 1 : 0,
      template,
      contentTemplate,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export function updateTheme(
  id: string,
  name: string,
  template: string,
  contentTemplate: string,
  activate = false
) {
  const db = getDb()

  if (activate) {
    db.update(emailThemes).set({ isActive: 0 }).run()
  }

  db.update(emailThemes)
    .set({
      name,
      isActive: activate ? 1 : undefined,
      template,
      contentTemplate,
      updatedAt: Date.now(),
    })
    .where(eq(emailThemes.id, id))
    .run()
}
