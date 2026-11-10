import notifications from './notificationManager.js'
import { isRateLimitHigh } from './rateLimit.js'

const notifyIfRateLimitHigh = (rateLimitData, percent = 70) => {
  if (!isRateLimitHigh(rateLimitData, percent)) return false

  notifications.notify(
    `GitHub API rate limit is above ${percent}%. Consider reducing request volume or adding a personal access token.`,
    'warning',
  )

  return true
}

export { notifyIfRateLimitHigh }
