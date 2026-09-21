function createRequestControl(externalSignal, timeout) {
    const controller = new AbortController();
    let timedOut = false;

    const abortFromExternalSignal = () => controller.abort(externalSignal.reason);

    if (externalSignal?.aborted) {
        abortFromExternalSignal();
    } else {
        externalSignal?.addEventListener("abort", abortFromExternalSignal, { once: true });
    }

    const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort(new DOMException("GitHub request timed out", "TimeoutError"));
    }, timeout);

    return {
        signal: controller.signal,
        didTimeout: () => timedOut,
        cleanup: () => {
            clearTimeout(timeoutId);
            externalSignal?.removeEventListener("abort", abortFromExternalSignal);
        },
    };
}

export default createRequestControl;
