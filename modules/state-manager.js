/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Config} Config */

//
// state manager
//

export default class StateManager {
    /**
     * Constructor
     * 
     * @param {Config} gameConfig
     */
    constructor(gameConfig) {
        this._gameConfig = gameConfig;
        
        this.reloadFromConfig();
    }

    _updateRegions = [1];

    reloadFromConfig() {
        const pinStates = this._initPinStates(this._gameConfig.keyPins);

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

        this.invalidateAll();
    }

    invalidateAll() {
        this._updateRegions.push(1);
    }

    loadFromObject(serializedObject) {
    }

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
        this.invalidateAll();
    }

    activateNextPin() {
        this._currentState.activePin = this._pinIterator.next().value;
        this.invalidateAll();
    }

    get PinDeltaAngle() {
        return this._currentState.pinDeltaAngle;
    }
    set PinDeltaAngle(dTheta) {
        this._currentState.pinDeltaAngle = dTheta;
        this.invalidateAll();
    }

    get ActivePin() {
        return this._currentState.activePin;
    }

    get TumblerAngle() {
        return this._currentState.tumblerAngle;
    }
    set TumblerAngle(v) {
        this._currentState.tumblerAngle = v;
        this.invalidateAll();
    }
}