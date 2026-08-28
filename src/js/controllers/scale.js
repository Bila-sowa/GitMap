import canvas from "./canvas";
import * as DOM from "./dom";

class ScaleController {
    #abortController = null;
    #previousOnChange = null;

    constructor(increaseButton, display, decreaseButton) {
        this.increaseButton = increaseButton;
        this.display = display;
        this.decreaseButton = decreaseButton;
        this.step = 0.1;
        this.#bindEvents();
        this.render();
    }

    #bindEvents() {
        if (this.#abortController) this.#abortController.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

        this.increaseButton.addEventListener("click", this.#onIncrease, { signal });
        this.decreaseButton.addEventListener("click", this.#onDecrease, { signal });

        this.#previousOnChange = canvas.onChange;
        canvas.onChange = (instance) => {
            this.#previousOnChange?.(instance);
            this.render();
        };
    }

    #onIncrease = () => {
        canvas.zoom(1 + this.step);
    };

    #onDecrease = () => {
        canvas.zoom(1 / (1 + this.step));
    };

    render() {
        this.display.textContent = `${Math.round(canvas.scale * 100)}%`;
    }

    destroy() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
        if (canvas.onChange) {
            canvas.onChange = this.#previousOnChange;
            this.#previousOnChange = null;
        }
    }
}

const scale = new ScaleController(DOM.scaleIncreaseButton, DOM.scaleDisplay, DOM.scaleDecreaseButton);

export { ScaleController };
export default scale;
