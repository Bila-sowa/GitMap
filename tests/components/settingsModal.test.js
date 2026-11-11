// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  bindSettingsModalEvents,
  generateSettingsModalHTML,
  getTokenStatusState,
} from '@/js/components/SettingsModal'
import { HttpError } from '@/js/errors'

const rateLimitData = { limitPerNumber: 5000, usedPerNumber: 10, usedPerPercent: 0.2 }
const versionDetails = { version: '2.11.26', versionIsStable: true }

function createModal() {
  const template = document.createElement('template')

  template.innerHTML = generateSettingsModalHTML(rateLimitData, 'valid', versionDetails).trim()

  const modal = template.content.firstElementChild

  document.body.append(modal)

  return modal
}

describe('SettingsModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('does not embed the token in the generated markup', () => {
    const modal = createModal()
    const tokenInput = modal.querySelector('#token-input')

    expect(tokenInput.hasAttribute('value')).toBe(false)
  })

  test('renders the rate limit values and token status', () => {
    const modal = createModal()
    const progress = modal.querySelector('#settings-rest-api-limit-progress')

    expect(progress.title).toBe('Used: 10 / 5000')
    expect(progress.getAttribute('aria-valuenow')).toBe('0.2')
    expect(modal.querySelector('#token-status').textContent.trim()).toBe('Active')
  })

  test('renders an unavailable rate limit when the data is missing', () => {
    const template = document.createElement('template')

    template.innerHTML = generateSettingsModalHTML(null, 'unavailable', versionDetails).trim()

    const modal = template.content.firstElementChild
    const progress = modal.querySelector('#settings-rest-api-limit-progress')

    expect(progress.title).toBe('Rate limit data is unavailable.')
    expect(progress.hasAttribute('aria-valuenow')).toBe(false)
  })

  test('marks an unknown version stability without the not-stable warning', () => {
    const template = document.createElement('template')

    template.innerHTML = generateSettingsModalHTML(rateLimitData, 'valid', {
      version: 'unknown',
      versionIsStable: 'unknown',
    }).trim()

    const modal = template.content.firstElementChild

    expect(modal.textContent).toContain('(unknown)')
    expect(modal.textContent).not.toContain('(not stable)')
  })

  test('marks an unstable version', () => {
    const template = document.createElement('template')

    template.innerHTML = generateSettingsModalHTML(rateLimitData, 'valid', {
      version: '2.11.26',
      versionIsStable: false,
    }).trim()

    const modal = template.content.firstElementChild

    expect(modal.textContent).toContain('(not stable)')
    expect(modal.textContent).not.toContain('(unknown)')
  })

  test('clears the token input when the modal closes', () => {
    const modal = createModal()
    const tokenInput = modal.querySelector('#token-input')
    const storage = { getData: () => ({ localStorage: { saveLink: false, saveToken: false } }) }

    tokenInput.value = 'ghp_secretToken'
    bindSettingsModalEvents(modal, () => {}, { storage, localStorage: {}, gitHubClient: {} })
    modal.querySelector('#close-settings-button').click()

    expect(tokenInput.value).toBe('')
    expect(modal.isConnected).toBe(false)
  })
})

describe('getTokenStatusState', () => {
  test('returns no-token when no token is configured', () => {
    expect(getTokenStatusState(null, false)).toBe('no-token')
  })

  test('returns valid when the token check succeeds', () => {
    expect(getTokenStatusState(null, true)).toBe('valid')
  })

  test('returns invalid for a rejected token', () => {
    const error = new HttpError('Unauthorized', { status: 401 })

    expect(getTokenStatusState(error, true)).toBe('invalid')
  })

  test('returns unavailable for any other failure', () => {
    const error = new HttpError('Server error', { status: 500 })

    expect(getTokenStatusState(error, true)).toBe('unavailable')
  })
})
