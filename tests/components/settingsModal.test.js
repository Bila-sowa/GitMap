// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { bindSettingsModalEvents, generateSettingsModalHTML } from '@/js/components/SettingsModal'

const rateLimitResponse = {
  success: true,
  data: { limitPerNumber: 5000, usedPerNumber: 10, usedPerPercent: 0.2 },
}
const versionDetails = { version: '2.11.26', versionIsStable: true }

function createModal() {
  const template = document.createElement('template')

  template.innerHTML = generateSettingsModalHTML(rateLimitResponse, 'valid', versionDetails).trim()

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
