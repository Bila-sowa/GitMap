class GitHubHttpApi {
    getHttpErrorMessage(status) {
        switch (status) {
            case 400:
                return "Bad Request (400): Unable to process request.";
            case 401:
                return "Unauthorized (401): Bad credentials or invalid GitHub token.";
            case 403:
                return "Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.";
            case 404:
                return "Not Found (404): Repository or resource not found.";
            case 409:
                return "Conflict (409): Git repository is empty or conflict occurred.";
            case 422:
                return "Unprocessable Entity (422): Validation failed or resource is locked.";
            case 429:
                return "Too Many Requests (429): GitHub API rate limit exceeded.";
            case 500:
                return "Internal Server Error (500): GitHub encountered an internal error.";
            case 501:
                return "Not Implemented (501): Feature not supported by GitHub.";
            case 502:
                return "Bad Gateway (502): Invalid response from upstream GitHub servers.";
            case 503:
                return "Service Unavailable (503): GitHub is temporarily offline or undergoing maintenance.";
            case 504:
                return "Gateway Timeout (504): GitHub timed out waiting for upstream server.";
            default:
                return `GitHub API error (HTTP ${status}).`;
        }
    }

    async createHttpError(res, url = "") {
        let apiMessage = "";

        try {
            const apiResponse = await res.json();
            if (apiResponse && typeof apiResponse === "object" && apiResponse.message) {
                apiMessage = apiResponse.message;
            }
        } catch {
            console.warn(`createHttpError: failed to parse JSON response body for "${url}".`, error);
        }

        const userError = this.getHttpErrorMessage(res.status);
        const devDetails = [];
        if (apiMessage) devDetails.push(`API Message: "${apiMessage}"`);
        if (url) devDetails.push(`URL: ${url}`);

        const devMessage = devDetails.length ? `${userError} [${devDetails.join(", ")}]` : userError;

        return {
            error: userError,
            devError: {
                status: res.status,
                message: devMessage,
                url,
            },
        };
    }
}

export default GitHubHttpApi;
