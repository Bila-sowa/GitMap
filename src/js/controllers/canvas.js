import * as DOM from "./dom.js";

const PAN_THRESHOLD = 5;

class CanvasController {
    #abortController = null;
    #isPanning = false;
    #isPanPending = false;
    #hasDragged = false;
    #panTarget = null;
    #suppressClickTarget = null;
    #suppressClickTimeout = null;
    #startX = 0;
    #startY = 0;
    #lastOffsetX = 0;
    #lastOffsetY = 0;
    #lastPinchDist = 0;
    #isPinching = false;
    #pinchWorldX = 0;
    #pinchWorldY = 0;
    #pinchStartScale = 1;

    constructor(viewport, canvasElement) {
        this.viewport = viewport;
        this.canvas = canvasElement;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.minScale = 0.1;
        this.maxScale = 5;
        this.zoomSensitivity = 0.001;
        this.onChange = null;
        this.canvas.style.transformOrigin = "0 0";
        this.#bindEvents();
        this.#applyTransform();
    }

    #bindEvents() {
        if (this.#abortController) this.#abortController.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

        this.viewport.addEventListener("mousedown", this.#onMouseDown, { signal });
        window.addEventListener("mousemove", this.#onMouseMove, { signal });
        window.addEventListener("mouseup", this.#onMouseUp, { signal });
        this.viewport.addEventListener("click", this.#onClick, { capture: true, signal });
        this.viewport.addEventListener("wheel", this.#onWheel, { passive: false, signal });
        this.viewport.addEventListener("touchstart", this.#onTouchStart, { passive: false, signal });
        this.viewport.addEventListener("touchmove", this.#onTouchMove, { passive: false, signal });
        this.viewport.addEventListener("touchend", this.#onTouchEnd, { signal });
        this.viewport.addEventListener("touchcancel", this.#onTouchCancel, { signal });
        window.addEventListener("blur", this.#endTouchGesture, { signal });
    }

    #clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    #startPan(x, y, target) {
        this.#isPanning = false;
        this.#isPanPending = true;
        this.#hasDragged = false;
        this.#panTarget = typeof target?.closest === "function" ? target.closest("[data-id]") : null;
        this.#startX = x;
        this.#startY = y;
        this.#lastOffsetX = this.offsetX;
        this.#lastOffsetY = this.offsetY;
    }

    #movePan(x, y) {
        if (!this.#isPanPending) return;

        const deltaX = x - this.#startX;
        const deltaY = y - this.#startY;

        if (!this.#isPanning && Math.hypot(deltaX, deltaY) < PAN_THRESHOLD) return;

        this.#isPanning = true;
        this.#hasDragged = true;
        this.viewport.classList.add("is-panning");
        this.offsetX = this.#lastOffsetX + (x - this.#startX);
        this.offsetY = this.#lastOffsetY + (y - this.#startY);
        this.#applyTransform();
    }

    #endPan() {
        if (this.#hasDragged && this.#panTarget) {
            const draggedTarget = this.#panTarget;
            this.#suppressClickTarget = draggedTarget;
            clearTimeout(this.#suppressClickTimeout);
            this.#suppressClickTimeout = setTimeout(() => {
                if (this.#suppressClickTarget === draggedTarget) {
                    this.#suppressClickTarget = null;
                }
            }, 0);
        }

        this.#isPanning = false;
        this.#isPanPending = false;
        this.#hasDragged = false;
        this.#panTarget = null;
        this.viewport.classList.remove("is-panning");
    }

    #startPinch(touches) {
        const rect = this.viewport.getBoundingClientRect();
        const midX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
        const midY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;

        this.#endPan();
        this.#isPinching = true;
        this.#lastPinchDist = this.#getPinchDistance(touches);
        this.#pinchStartScale = this.scale;
        this.#pinchWorldX = (midX - this.offsetX) / this.scale;
        this.#pinchWorldY = (midY - this.offsetY) / this.scale;
    }

    #endPinch() {
        this.#isPinching = false;
    }

    #getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    #onMouseDown = (e) => {
        if (e.button !== 0) return;
        if (e.target !== this.viewport && e.target !== this.canvas && !this.canvas.contains(e.target)) {
            return;
        }
        this.#startPan(e.clientX, e.clientY, e.target);
    };

    #onMouseMove = (e) => {
        this.#movePan(e.clientX, e.clientY);
    };

    #onMouseUp = () => {
        this.#endPan();
    };

    #onClick = (e) => {
        const commitButton = typeof e.target?.closest === "function" ? e.target.closest("[data-id]") : null;

        if (commitButton !== this.#suppressClickTarget) return;

        clearTimeout(this.#suppressClickTimeout);
        this.#suppressClickTarget = null;
        e.preventDefault();
        e.stopPropagation();
    };

    #onWheel = (e) => {
        e.preventDefault();

        const rect = this.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (e.ctrlKey) {
            const delta = -e.deltaY * this.zoomSensitivity;
            this.zoomAt(mouseX, mouseY, this.scale * (1 + delta));
            return;
        }

        this.panBy(-e.deltaX, -e.deltaY);
    };

    #onTouchStart = (e) => {
        if (e.touches.length === 1) {
            this.#endPinch();
            this.#startPan(e.touches[0].clientX, e.touches[0].clientY, e.target);
            return;
        }

        if (e.touches.length === 2) {
            this.#startPinch(e.touches);
        }
    };

    #onTouchMove = (e) => {
        e.preventDefault();

        if (e.touches.length === 1 && this.#isPanPending) {
            this.#movePan(e.touches[0].clientX, e.touches[0].clientY);
            return;
        }

        if (e.touches.length === 2) {
            if (!this.#isPinching) this.#startPinch(e.touches);

            const dist = this.#getPinchDistance(e.touches);
            if (this.#lastPinchDist === 0) return;

            const scaleRatio = dist / this.#lastPinchDist;
            const rect = this.viewport.getBoundingClientRect();
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

            this.scale = this.#clamp(this.#pinchStartScale * scaleRatio, this.minScale, this.maxScale);
            this.offsetX = midX - this.#pinchWorldX * this.scale;
            this.offsetY = midY - this.#pinchWorldY * this.scale;
            this.#applyTransform();
        }
    };

    #onTouchEnd = (e) => {
        if (e.touches.length === 1) {
            this.#endPinch();
            this.#startPan(e.touches[0].clientX, e.touches[0].clientY, e.target);
            return;
        }

        if (e.touches.length === 0) this.#endTouchGesture();
    };

    #onTouchCancel = () => {
        this.#endTouchGesture();
    };

    #endTouchGesture = () => {
        this.#endPan();
        this.#endPinch();
    };

    #applyTransform() {
        this.canvas.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        this.onChange?.(this);
    }

    panBy(dx, dy) {
        this.offsetX += dx;
        this.offsetY += dy;
        this.#applyTransform();
    }

    panTo(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.#applyTransform();
    }

    setScale(scale) {
        this.scale = this.#clamp(scale, this.minScale, this.maxScale);
        this.#applyTransform();
    }

    zoomAt(originX, originY, newScale) {
        const clamped = this.#clamp(newScale, this.minScale, this.maxScale);
        const scaleRatio = clamped / this.scale;
        this.offsetX = originX - scaleRatio * (originX - this.offsetX);
        this.offsetY = originY - scaleRatio * (originY - this.offsetY);
        this.scale = clamped;
        this.#applyTransform();
    }

    reset() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.#applyTransform();
    }

    centerOn(worldX, worldY) {
        const rect = this.viewport.getBoundingClientRect();
        this.offsetX = rect.width / 2 - worldX * this.scale;
        this.offsetY = rect.height / 2 - worldY * this.scale;
        this.#applyTransform();
    }

    zoom(factor) {
        const rect = this.viewport.getBoundingClientRect();
        this.zoomAt(rect.width / 2, rect.height / 2, this.scale * factor);
    }

    getTransform() {
        return {
            scale: this.scale,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
        };
    }

    destroy() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
        clearTimeout(this.#suppressClickTimeout);
        this.#suppressClickTarget = null;
        this.#endTouchGesture();
    }
}

const canvas = new CanvasController(DOM.viewport, DOM.canvas);

export { CanvasController };
export default canvas;
