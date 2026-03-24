/** @typedef {import("./types.js").Context} Context */

//
// Implement Me!
//

export default class ContextManager {
    constructor() {
        /** @type {Context} */
        this._ctx = { };
    }

    // EG:
    attachStateManager(stateManager) {
        this._ctx.s = stateManager;
    }

    /** @returns {Context} */
    getCtx() {
        return this._ctx;
    }
}