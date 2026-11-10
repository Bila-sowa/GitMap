import { isCorrectHttpStatus, isPlainObject } from '@/js/utils/matchers'
import { logger } from '@/js/utils/logger'
import { HttpError } from '@/js/errors'
import { HTTP_ERROR_MESSAGES } from './gitHubConstants'

class GitHubHttpApi {
  getHttpErrorMessage(status) {
    if (!isCorrectHttpStatus(status)) return null

    return HTTP_ERROR_MESSAGES[status] ?? `GitHub API error (HTTP ${status}).`
  }

  async createHttpError(res, url = '') {
    let apiMessage = ''

    try {
      const apiResponse = await res.json()
      if (isPlainObject(apiResponse) && apiResponse.message) {
        apiMessage = apiResponse.message
      }
    } catch (cause) {
      logger.warn(`createHttpError: failed to parse JSON response body for "${url}".`, cause)
    }

    const userMessage = this.getHttpErrorMessage(res.status)
    const devDetails = []
    if (apiMessage) devDetails.push(`API Message: "${apiMessage}"`)
    if (url) devDetails.push(`URL: ${url}`)

    const message =
      userMessage && devDetails.length
        ? `${userMessage} [${devDetails.join(', ')}]`
        : (userMessage ?? `GitHub API error (HTTP ${res.status}).`)

    return new HttpError(message, {
      status: res.status,
      url,
      apiMessage,
      userMessage,
      context: 'createHttpError',
    })
  }
}

export default GitHubHttpApi
