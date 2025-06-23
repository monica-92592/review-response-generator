import { createLazyComponent } from './LazyLoader'

// Lazy load heavy components that are not immediately needed
export const LazyChart = createLazyComponent(() => import('./Chart'))
export const LazyTemplateCreator = createLazyComponent(() => import('./TemplateCreator').then(m => ({ default: m.TemplateCreator })))
export const LazyTemplateSharing = createLazyComponent(() => import('./TemplateSharing').then(m => ({ default: m.TemplateSharing })))
export const LazyKeyboardShortcutsModal = createLazyComponent(() => import('./KeyboardShortcutsModal'))
export const LazyAccessibilitySettings = createLazyComponent(() => import('./AccessibilitySettings')) 