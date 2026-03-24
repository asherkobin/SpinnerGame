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
     */
    constructor(gameConfig) {
        const pinStates = this._initPinStates(gameConfig.keyPins);

        /** @type {State} */
        this._currentState = {
            tumblerAngle: 0,
            lastTime: 0,
            pinDeltaAngle: 0,
            pinStates: pinStates,
            lastLeftKeyDown: 0,
            lastRightKeyDown: 0,
            allPinsInserted: false,
            plugAngle: 0,
            needsRedraw: true,
            activePin: null
        }

        this._pinIterator = pinStates.values();
        this._currentState.activePin = this._pinIterator.next().value;
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

    insertPin(pinToInsert) {
        pinToInsert.i = true;
        this._updateRegions.push(1);
    }

    activateNextPin() {
        this._currentState.activePin = this._pinIterator.next().value;
        this._updateRegions.push(1);
    }

    get PinDeltaAngle() {
        return this._currentState.pinDeltaAngle;
    }
    set PinDeltaAngle(dTheta) {
        this._currentState.pinDeltaAngle = dTheta;
        this._updateRegions.push(1);
    }

    get ActivePin() {
        return this._currentState.activePin;
    }

    get TumblerAngle() {
        return this._currentState.tumblerAngle;
    }
}