import ModalState from "./modalState.js";
import FullCommitModal from "./fullCommitModal.js";
import HoverCommitModal from "./hoverCommitModal.js";

export function createCommitModals(graphElement, options) {
    const state = new ModalState(graphElement, options);
    const fullModal = new FullCommitModal(state);
    const hoverModal = new HoverCommitModal(state);

    fullModal.bindEvents();
    hoverModal.bindEvents();

    return { state, fullModal, hoverModal };
}

export { ModalState, FullCommitModal, HoverCommitModal };
