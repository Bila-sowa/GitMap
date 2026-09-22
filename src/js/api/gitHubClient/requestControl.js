class RequestControl {
    #controller = new AbortController();
    #externalSignal;
    #timedOut = false;
    #timeoutId;

    constructor(externalSignal, timeout) {
        this.#externalSignal = externalSignal;

        if (externalSignal?.aborted) {
            this.#abortFromExternalSignal();
        } else {
            externalSignal?.addEventListener("abort", this.#abortFromExternalSignal, { once: true });
        }

        this.#timeoutId = setTimeout(() => {
            this.#timedOut = true;
            this.#controller.abort(new DOMException("GitHub request timed out", "TimeoutError"));
        }, timeout);
    }

    #abortFromExternalSignal = () => this.#controller.abort(this.#externalSignal.reason);

    get signal() {
        return this.#controller.signal;
    }

    didTimeout() {
        return this.#timedOut;
    }

    cleanup() {
        clearTimeout(this.#timeoutId);
        this.#externalSignal?.removeEventListener("abort", this.#abortFromExternalSignal);
    }
}

export default RequestControl;
