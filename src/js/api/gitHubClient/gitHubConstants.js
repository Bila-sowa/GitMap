const GITHUB_API_ORIGIN = 'https://api.github.com'
const HTTP_ERROR_MESSAGES = {
  400: 'Bad Request (400): Unable to process request.',
  401: 'Unauthorized (401): Bad credentials or invalid GitHub token.',
  403: 'Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.',
  404: 'Not Found (404): Repository or resource not found.',
  409: 'Conflict (409): Git repository is empty or conflict occurred.',
  422: 'Unprocessable Entity (422): Validation failed or resource is locked.',
  429: 'Too Many Requests (429): GitHub API rate limit exceeded.',
  500: 'Internal Server Error (500): GitHub encountered an internal error.',
  501: 'Not Implemented (501): Feature not supported by GitHub.',
  502: 'Bad Gateway (502): Invalid response from upstream GitHub servers.',
  503: 'Service Unavailable (503): GitHub is temporarily offline or undergoing maintenance.',
  504: 'Gateway Timeout (504): GitHub timed out waiting for upstream server.',
}

const isGitHubApiUrl = (url) => {
  const parsedUrl = url instanceof URL ? url : new URL(url)

  return parsedUrl.origin === GITHUB_API_ORIGIN
}

export { GITHUB_API_ORIGIN, isGitHubApiUrl, HTTP_ERROR_MESSAGES }
