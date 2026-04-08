import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { emailThemes } from '../db/schema'
import type { EmailThemeConfig } from '../email/types'

const DEFAULT_THEME: EmailThemeConfig = {
  primaryColor: '#0ea5e9',
  bgColor: '#ffffff',
  textColor: '#171717',
  accentColor: '#f59e0b',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  layout: 'expanded',
}

export function getActiveTheme(): EmailThemeConfig {
  const db = getDb()
  const theme = db
    .select()
    .from(emailThemes)
    .where(eq(emailThemes.isActive, 1))
    .get()

  if (!theme) return DEFAULT_THEME

  return {
    primaryColor: theme.primaryColor,
    bgColor: theme.bgColor,
    textColor: theme.textColor,
    accentColor: theme.accentColor,
    fontFamily: theme.fontFamily,
    layout: theme.layout as 'compact' | 'expanded' | 'magazine',
    customCss: theme.customCss ?? undefined,
  }
}

export function listThemes() {
  const db = getDb()
  return db.select().from(emailThemes).all()
}

export function createTheme(
  name: string,
  config: EmailThemeConfig,
  activate = false
) {
  const db = getDb()
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const now = Date.now()

  if (activate) {
    // Deactivate all other themes
    db.update(emailThemes).set({ isActive: 0 }).run()
  }

  db.insert(emailThemes)
    .values({
      id,
      name,
      isActive: activate ? 1 : 0,
      primaryColor: config.primaryColor,
      bgColor: config.bgColor,
      textColor: config.textColor,
      accentColor: config.accentColor,
      fontFamily: config.fontFamily,
      layout: config.layout,
      customCss: config.customCss ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export function updateTheme(
  id: string,
  name: string,
  config: EmailThemeConfig,
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
      primaryColor: config.primaryColor,
      bgColor: config.bgColor,
      textColor: config.textColor,
      accentColor: config.accentColor,
      fontFamily: config.fontFamily,
      layout: config.layout,
      customCss: config.customCss ?? null,
      updatedAt: Date.now(),
    })
    .where(eq(emailThemes.id, id))
    .run()
}

