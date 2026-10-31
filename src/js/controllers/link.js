import { config } from '../api/config.js'
import { addLinkToHistory } from '../utils/linkHistory.js'

class LinkController {
  #input
  #historyContainer
  #historyList
  #graph
  #storage
  #localStorage
  #abortController = null
  #activeHistoryIndex = -1
  #isSelectingHistory = false
  #hideHistoryTimeout = null

  constructor(input, historyContainer, historyList, graph, storage, localStorage) {
    this.#input = input
    this.#historyContainer = historyContainer
    this.#historyList = historyList
    this.#graph = graph
    this.#storage = storage
    this.#localStorage = localStorage
  }

  init() {
    this.#input.value = this.#storage.getData().link || ''
    this.#renderHistory()
    this.#bindEvents()
    return this
  }

  #bindEvents() {
    this.#cancelHistoryHide()
    this.#abortController?.abort()
    this.#abortController = new AbortController()
    const { signal } = this.#abortController

    this.#input.addEventListener('keydown', (event) => this.#onInputKeyDown(event), { signal })
    this.#input.addEventListener('blur', () => this.#onInputBlur(), { signal })
    this.#input.addEventListener('focus', () => this.#openHistory(), { signal })
    this.#input.addEventListener('input', () => this.#closeHistory(), { signal })

    this.#historyContainer.addEventListener('mouseenter', () => this.#openHistory(), { signal })
    this.#historyContainer.addEventListener('mouseleave', () => this.#onHistoryMouseLeave(), {
      signal,
    })

    this.#historyList.addEventListener(
      'pointerdown',
      (event) => this.#onHistoryPointerDown(event),
      { signal },
    )
    this.#historyList.addEventListener('click', (event) => this.#onHistoryClick(event), { signal })
    this.#historyList.addEventListener('mouseover', (event) => this.#onHistoryMouseOver(event), {
      signal,
    })

    document.addEventListener('click', (event) => this.#onOutsideClick(event), { signal })
  }

  #renderHistory() {
    const fragment = document.createDocumentFragment()

    this.#storage.getData().history.forEach((link, index) => {
      if (typeof link !== 'string' || !link.trim()) return

      const item = document.createElement('li')

      item.className = 'link-history-item'
      item.id = `link-history-option-${index}`
      item.setAttribute('role', 'option')
      item.setAttribute('aria-selected', 'false')
      item.dataset.link = link
      item.title = link
      item.textContent = link
      fragment.append(item)
    })

    this.#historyList.replaceChildren(fragment)
    this.#closeHistory()
  }

  #openHistory() {
    if (!this.#getHistoryItems().length) return

    this.#cancelHistoryHide()
    this.#historyList.classList.remove('hidden')
    this.#input.setAttribute('aria-expanded', 'true')
  }

  #closeHistory() {
    this.#cancelHistoryHide()
    this.#historyList.classList.add('hidden')
    this.#input.setAttribute('aria-expanded', 'false')
    this.#activeHistoryIndex = -1

    this.#getHistoryItems().forEach((item) => item.setAttribute('aria-selected', 'false'))
    this.#input.removeAttribute('aria-activedescendant')
  }

  #scheduleHistoryHide() {
    this.#cancelHistoryHide()

    this.#hideHistoryTimeout = setTimeout(() => {
      this.#hideHistoryTimeout = null

      if (document.activeElement === this.#input) return

      this.#closeHistory()
    }, config.settings.linkHistory.HIDE_DELAY_MS)
  }

  #cancelHistoryHide() {
    if (this.#hideHistoryTimeout === null) return

    clearTimeout(this.#hideHistoryTimeout)
    this.#hideHistoryTimeout = null
  }

  #getHistoryItems() {
    return [...this.#historyList.querySelectorAll('.link-history-item')]
  }

  #isHistoryOpen() {
    return !this.#historyList.classList.contains('hidden')
  }

  #setActiveHistory(index) {
    const items = this.#getHistoryItems()

    if (!items.length) return

    const nextIndex = ((index % items.length) + items.length) % items.length

    this.#activeHistoryIndex = nextIndex
    items.forEach((item, itemIndex) => {
      item.setAttribute('aria-selected', String(itemIndex === nextIndex))
    })
    this.#input.setAttribute('aria-activedescendant', items[nextIndex].id)
  }

  #selectHistoryItem(item) {
    const link = item.dataset.link

    if (!link) return

    this.#isSelectingHistory = true
    this.#input.value = link
    this.#input.focus()
    this.#input.setSelectionRange(link.length, link.length)
    this.#closeHistory()

    queueMicrotask(() => {
      this.#isSelectingHistory = false
    })
  }

  #onInputKeyDown(event) {
    const items = this.#getHistoryItems()

    if (event.key === 'ArrowDown') {
      if (!items.length) return

      event.preventDefault()

      if (!this.#isHistoryOpen()) {
        this.#openHistory()
        this.#setActiveHistory(0)
      } else {
        this.#setActiveHistory(this.#activeHistoryIndex < 0 ? 0 : this.#activeHistoryIndex + 1)
      }

      return
    }

    if (event.key === 'ArrowUp') {
      if (!items.length) return

      event.preventDefault()

      if (!this.#isHistoryOpen()) {
        this.#openHistory()
        this.#setActiveHistory(items.length - 1)
      } else {
        this.#setActiveHistory(
          this.#activeHistoryIndex < 0 ? items.length - 1 : this.#activeHistoryIndex - 1,
        )
      }

      return
    }

    if (event.key === 'Enter') {
      if (this.#isHistoryOpen() && this.#activeHistoryIndex >= 0) {
        const item = items[this.#activeHistoryIndex]

        if (item) {
          event.preventDefault()
          this.#selectHistoryItem(item)
          return
        }
      }

      this.#setLink(this.#input.value.trim())
      return
    }

    if (event.key === 'Escape' && this.#isHistoryOpen()) {
      event.preventDefault()
      this.#closeHistory()
      return
    }

    if (event.key === 'Tab') this.#closeHistory()
  }

  #onInputBlur() {
    this.#closeHistory()

    if (this.#isSelectingHistory) return

    const value = this.#input.value.trim()

    if (value) this.#setLink(value)
  }

  #onHistoryMouseLeave() {
    if (document.activeElement === this.#input) return

    this.#scheduleHistoryHide()
  }

  #onHistoryPointerDown(event) {
    const item = event.target.closest('.link-history-item')

    if (!item) return

    event.preventDefault()
    this.#selectHistoryItem(item)
  }

  #onHistoryClick(event) {
    const item = event.target.closest('.link-history-item')

    if (item) this.#selectHistoryItem(item)
  }

  #onHistoryMouseOver(event) {
    const item = event.target.closest('.link-history-item')

    if (!item) return

    const index = this.#getHistoryItems().indexOf(item)

    if (index >= 0) this.#setActiveHistory(index)
  }

  #onOutsideClick(event) {
    if (!this.#historyContainer.contains(event.target)) this.#closeHistory()
  }

  async #setLink(value) {
    this.#closeHistory()
    this.#storage.setData({ link: value })

    const result = await this.#graph.render()

    if (!this.#abortController || this.#abortController.signal.aborted) return

    if (result.success) {
      const history = addLinkToHistory(this.#storage.getData().history, value)

      this.#storage.setData({ history })
      this.#renderHistory()
    }

    if (result.success || this.#storage.getData().localStorage.saveLink)
      await this.#localStorage.save()
  }

  destroy() {
    this.#cancelHistoryHide()
    this.#abortController?.abort()
    this.#abortController = null
  }
}

export { LinkController }
