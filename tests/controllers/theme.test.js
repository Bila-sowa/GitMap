// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThemeController } from '@/js/controllers/theme'
import { Storage } from '@/js/data/storage'

const originalMatchMedia = window.matchMedia

function createMediaQuery(matches) {
  const listeners = new Set()

  return {
    matches,
    addEventListener(type, listener, options) {
      listeners.add(listener)
      options?.signal?.addEventListener('abort', () => listeners.delete(listener), { once: true })
    },
    removeEventListener(type, listener) {
      listeners.delete(listener)
    },
    dispatch(matches) {
      this.matches = matches
      listeners.forEach((listener) => listener({ matches }))
    },
    get listenerCount() {
      return listeners.size
    },
  }
}

function createController({ theme = 'system', matches = true } = {}) {
  const mediaQuery = createMediaQuery(matches)

  window.matchMedia = vi.fn(() => mediaQuery)
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '#123456',
  })

  document.head.innerHTML = '<meta id="theme-color" content="#010409">'
  document.body.className = 'dark-theme'

  const button = document.createElement('button')
  button.id = 'theme'
  document.body.append(button)

  const storage = new Storage()
  storage.setData({ theme })

  const localStorage = { save: vi.fn(async () => ({ success: true })) }
  const controller = new ThemeController(button, document.body, storage, localStorage)

  controller.init()

  return { controller, button, storage, localStorage, mediaQuery }
}

describe('ThemeController', () => {
  let activeController = null

  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.className = ''
    document.body.innerHTML = ''
  })

  afterEach(() => {
    activeController?.destroy()
    activeController = null
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
    document.head.innerHTML = ''
    document.body.className = ''
    document.body.innerHTML = ''
  })

  test('applies the system theme and follows OS changes', () => {
    const { controller, button, storage, localStorage, mediaQuery } = createController({
      theme: 'system',
      matches: true,
    })
    activeController = controller

    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('system')
    expect(button.getAttribute('aria-label')).toBe('Theme: System. Switch to dark theme.')
    expect(button.title).toBe('Theme: System')
    expect(storage.getData().theme).toBe('system')
    expect(localStorage.save).toHaveBeenCalledTimes(1)

    mediaQuery.dispatch(false)

    expect(document.body.classList.contains('light-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('system')
    expect(storage.getData().theme).toBe('system')
    expect(localStorage.save).toHaveBeenCalledTimes(1)
  })

  test('applies a stored dark theme and ignores OS changes', () => {
    const { controller, button, mediaQuery } = createController({
      theme: 'dark-theme',
      matches: false,
    })
    activeController = controller

    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('dark')
    expect(button.getAttribute('aria-label')).toBe('Theme: Dark. Switch to light theme.')

    mediaQuery.dispatch(true)

    expect(document.body.classList.contains('dark-theme')).toBe(true)
  })

  test('applies a stored light theme', () => {
    const { controller, button } = createController({ theme: 'light-theme', matches: true })
    activeController = controller

    expect(document.body.classList.contains('light-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('light')
    expect(button.getAttribute('aria-label')).toBe('Theme: Light. Switch to system theme.')
  })

  test('cycles through system, dark, and light', () => {
    const { controller, button, storage, localStorage } = createController({
      theme: 'system',
      matches: true,
    })
    activeController = controller

    localStorage.save.mockClear()

    button.click()
    expect(storage.getData().theme).toBe('dark-theme')
    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('dark')

    button.click()
    expect(storage.getData().theme).toBe('light-theme')
    expect(document.body.classList.contains('light-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('light')

    button.click()
    expect(storage.getData().theme).toBe('system')
    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(button.dataset.themeState).toBe('system')
    expect(localStorage.save).toHaveBeenCalledTimes(3)
  })

  test('updates the theme-color meta', () => {
    const { controller } = createController({ theme: 'dark-theme', matches: true })
    activeController = controller

    expect(document.querySelector('#theme-color').content).toBe('#123456')
  })

  test('removes the media query listener on destroy', () => {
    const { controller, mediaQuery } = createController({ theme: 'system', matches: true })

    expect(mediaQuery.listenerCount).toBe(1)

    controller.destroy()

    expect(mediaQuery.listenerCount).toBe(0)
  })
})
