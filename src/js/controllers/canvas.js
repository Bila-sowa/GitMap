export default class Canvas {
    constructor(viewport, canvas) {
        this.viewport = viewport;
        this.canvas = canvas;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.lastOffsetX = 0;
        this.lastOffsetY = 0;
        this.minScale = 0.1;
        this.maxScale = 5;
        this.zoomSensitivity = 0.001;
        this.#bindEvents();
        this.#applyTransform();
    }

    #applyTransform() {
        this.canvas.style.transform =
            `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
    }

    #clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    #bindEvents() {
        this.viewport.addEventListener('mousedown', (e) => this.#onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.#onMouseMove(e));
        window.addEventListener('mouseup', () => this.#onMouseUp());

        this.viewport.addEventListener('wheel', (e) => this.#onWheel(e), { passive: false });

        this.viewport.addEventListener('touchstart', (e) => this.#onTouchStart(e), { passive: false });
        this.viewport.addEventListener('touchmove', (e) => this.#onTouchMove(e), { passive: false });
        this.viewport.addEventListener('touchend', () => this.#onTouchEnd());
    }

    #onMouseDown(e) {
        if (e.button !== 0) return;
        if (e.target !== this.viewport && e.target !== this.canvas) return;

        this.isPanning = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.lastOffsetX = this.offsetX;
        this.lastOffsetY = this.offsetY;
        this.viewport.classList.add('is-panning');
    }

    #onMouseMove(e) {
        if (!this.isPanning) return;

        this.offsetX = this.lastOffsetX + (e.clientX - this.startX);
        this.offsetY = this.lastOffsetY + (e.clientY - this.startY);
        this.#applyTransform();
    }

    #onMouseUp() {
        if (!this.isPanning) return;
        this.isPanning = false;
        this.viewport.classList.remove('is-panning');
    }

    #onWheel(e) {
        e.preventDefault();

        const rect = this.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (e.ctrlKey) {
            const delta = -e.deltaY * this.zoomSensitivity;
            const newScale = this.#clamp(this.scale * (1 + delta), this.minScale, this.maxScale);
            const scaleRatio = newScale / this.scale;

            this.offsetX = mouseX - scaleRatio * (mouseX - this.offsetX);
            this.offsetY = mouseY - scaleRatio * (mouseY - this.offsetY);
            this.scale = newScale;
        } else {
            this.offsetX -= e.deltaX;
            this.offsetY -= e.deltaY;
        }

        this.#applyTransform();
    }

    #onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isPanning = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.lastOffsetX = this.offsetX;
            this.lastOffsetY = this.offsetY;
        } else if (e.touches.length === 2) {
            this.isPanning = false;
            this._lastPinchDist = this.#getPinchDistance(e.touches);
            this._pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            this._pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            this._pinchStartScale = this.scale;
            this._pinchStartOffsetX = this.offsetX;
            this._pinchStartOffsetY = this.offsetY;
        }
    }

    #onTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && this.isPanning) {
            this.offsetX = this.lastOffsetX + (e.touches[0].clientX - this.startX);
            this.offsetY = this.lastOffsetY + (e.touches[0].clientY - this.startY);
            this.#applyTransform();
        } else if (e.touches.length === 2) {
            const dist = this.#getPinchDistance(e.touches);
            const scaleRatio = dist / this._lastPinchDist;
            const newScale = this.#clamp(
                this._pinchStartScale * (dist / this.#getPinchDistance({ 0: { clientX: this._pinchMidX, clientY: this._pinchMidY }, 1: { clientX: this._pinchMidX + this._lastPinchDist, clientY: this._pinchMidY } })),
                this.minScale,
                this.maxScale
            );

            const rect = this.viewport.getBoundingClientRect();
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

            this.scale = this.#clamp(this._pinchStartScale * scaleRatio, this.minScale, this.maxScale);
            this.offsetX = midX - (this._pinchMidX - rect.left - this._pinchStartOffsetX) * (this.scale / this._pinchStartScale) - (midX - (this._pinchMidX - rect.left));
            this.offsetY = midY - (this._pinchMidY - rect.top - this._pinchStartOffsetY) * (this.scale / this._pinchStartScale) - (midY - (this._pinchMidY - rect.top));

            this.#applyTransform();
        }
    }

    #onTouchEnd() {
        this.isPanning = false;
    }

    #getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    reset() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.#applyTransform();
    }

    centerOn(worldX, worldY) {
        const rect = this.viewport.getBoundingClientRect();
        this.offsetX = rect.width  / 2 - worldX * this.scale;
        this.offsetY = rect.height / 2 - worldY * this.scale;
        this.#applyTransform();
    }
    
    zoom(factor) {
        const rect = this.viewport.getBoundingClientRect();
        const midX = rect.width  / 2;
        const midY = rect.height / 2;
        const newScale = this.#clamp(this.scale * factor, this.minScale, this.maxScale);
        const scaleRatio = newScale / this.scale;

        this.offsetX = midX - scaleRatio * (midX - this.offsetX);
        this.offsetY = midY - scaleRatio * (midY - this.offsetY);
        this.scale = newScale;
        this.#applyTransform();
    }
};
