/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Config} Config */

//
// state manager
//

export default class StateManager {
    /**
     * Creates New State
     * 
     * @param {Config} gameConfig
     * @returns {State}
     */
    createStateFromConfig(gameConfig) {
        const pinStates = this._initPinStates(gameConfig.keyPins);

        /** @type {State} */
        const newState = {
            tumblerAngle: 0,
            lastTime: 0,
            pinDeltaAngle: 0,
            pinStates: pinStates,
            lastLeftKeyDown: 0,
            lastRightKeyDown: 0,
            allPinsInserted: false,
            plugAngle: 0,
            needsRedraw: true,
            pinIterator: null,
            activePin: null
        }

        newState.pinIterator = pinStates.values();
        newState.activePin = newState.pinIterator.next().value;

        return newState;
    }

    _updateRegions = [1];

    /**
     * (NYI) Returns the regions that need updating due to state changes
     * 
     * @returns {Array}
     */
    getUpdateRegions() {
        return this._updateRegions;
    }

    /**
     * (NYI) Removes all update regions (usually as a result of redering)
     */
    clearUpdateRegions() {
        this._updateRegions.length = 0;
    }

    nextPin(state) {
        return state.pinIterator.next().value;
    }

    /** @param {State} currentState */
    set State(currentState) {
        /** @type {State} */
        this._currentState = currentState;
    }

    /** @returns {State} */
    get State() {
        return this._currentState;
    }

    set PinDeltaAngle(dTheta) {
        this._currentState.pinDeltaAngle = dTheta;
        this._updateRegions.push(1);
    }

    get PinDeltaAngle() {
        return this._currentState.pinDeltaAngle;
    }

    _initPinStates(pinConfig) {
        const pinStates = [];

        pinConfig.forEach(p => {
            const pinState = {
                w: p.widthDeg * Math.PI / 180,
                a: p.startDeg * Math.PI / 180,
                r: p.depthPx,
                i: false };

            pinState.ca = pinState.a;

            pinStates.push(pinState);
        });

        return pinStates;
    }
}