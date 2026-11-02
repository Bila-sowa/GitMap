import { isCorrectHttpStatus, isPlainObject } from '@/js/utils/matchers'
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
    } catch (err) {
      console.warn(`createHttpError: failed to parse JSON response body for "${url}".`, err)
    }

    const userError = this.getHttpErrorMessage(res.status)
    const devDetails = []
    if (apiMessage) devDetails.push(`API Message: "${apiMessage}"`)
    if (url) devDetails.push(`URL: ${url}`)

    const devMessage =
      userError && devDetails.length ? `${userError} [${devDetails.join(', ')}]` : userError

    return {
      error: userError,
      devError: {
        status: res.status,
        message: devMessage,
        url,
      },
    }
  }
}

export default GitHubHttpApi
