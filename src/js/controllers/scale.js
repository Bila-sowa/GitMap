class ScaleController {
    #abortController = null;
    #previousOnChange = null;
    #canvas;
    #lastObservedScale = null;

    constructor(increaseButton, display, decreaseButton, canvas) {
        this.increaseButton = increaseButton;
        this.display = display;
        this.decreaseButton = decreaseButton;
        this.#canvas = canvas;
        this.step = 0.1;
    }

    init() {
        this.#bindEvents();
        this.render();
        return this;
    }

    #bindEvents() {
        if (this.#abortController) this.#abortController.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

        this.increaseButton.addEventListener("click", this.#onIncrease, { signal });
        this.decreaseButton.addEventListener("click", this.#onDecrease, { signal });

        this.#previousOnChange = this.#canvas.onChange;
        this.#lastObservedScale = this.#canvas.scale;
        this.#canvas.onChange = (instance) => {
            this.#previousOnChange?.(instance);

            if (instance.scale === this.#lastObservedScale) return;

            this.#lastObservedScale = instance.scale;
            this.render();
        };
    }

    #onIncrease = () => {
        this.#canvas.zoom(1 + this.step);
    };

    #onDecrease = () => {
        this.#canvas.zoom(1 / (1 + this.step));
    };

    render() {
        const scaleLabel = `${Math.round(this.#canvas.scale * 100)}%`;
        if (this.display.textContent === scaleLabel) return;

        this.display.textContent = scaleLabel;
    }

    destroy() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
        if (this.#canvas.onChange) {
            this.#canvas.onChange = this.#previousOnChange;
            this.#previousOnChange = null;
        }
        this.#lastObservedScale = null;
    }
}

export { ScaleController };
