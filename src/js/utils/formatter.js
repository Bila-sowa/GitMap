import { isString } from './matchers.js'

const parseDate = (value) => {
  if (!value) return null

  const parsedDate = new Date(value)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

class Formatter {
  getCleanRepoUrl(repoUrl) {
    if (!isString(repoUrl)) return ''
    return repoUrl.replace(/\.git\/?$/, '').replace(/\/$/, '')
  }

  getFormattedTitle(commitName) {
    if (!isString(commitName)) return ''
    return commitName.split('\n').slice(0, 1).join('\n')
  }

  getFormattedDescription(commitName) {
    if (!isString(commitName)) return ''
    const parts = commitName.split('\n')
    if (parts.length <= 1) return ''
    return parts.slice(1).join('\n')
  }

  getDateInLocaleString(date, locales, options) {
    const parsedDate = parseDate(date)
    if (!parsedDate) return 'Invalid Date'
    return parsedDate.toLocaleString(locales, options)
  }

  getFormattedDate(date, locales, options) {
    const parsedDate = parseDate(date)
    if (!parsedDate) return 'Invalid Date'
    return new Intl.DateTimeFormat(locales, options).format(parsedDate)
  }

  getShortHash(hash) {
    if (!isString(hash)) return ''
    return hash.slice(0, 7)
  }

  getFormattedExtension(fileName) {
    if (!isString(fileName) || !fileName) return 'file'

    const baseName = fileName.split(/[\\/]/).pop().toLowerCase()
    const extensionSeparator = baseName.lastIndexOf('.')

    if (extensionSeparator <= 0 || extensionSeparator === baseName.length - 1) return 'file'

    return baseName.slice(extensionSeparator + 1).toLowerCase()
  }

  getShortStatus(fileStatus) {
    if (!isString(fileStatus)) return ''
    return fileStatus.slice(0, 1).toUpperCase()
  }
}

const formatter = new Formatter()

export { Formatter }
export default formatter
