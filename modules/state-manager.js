/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").PinInfo} PinInfo */

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
        
        this.loadFromConfig();
    }

    _updateRegions = [1];

    loadFromConfig() {
        /** @type {State} */
        this._currentState = {
            tumblerAngle: 0,
            lastTime: 0,
            pinDeltaAngle: 0,
            lastLeftKeyDown: 0,
            lastRightKeyDown: 0,
            allPinsInserted: false,
            plugAngle: 0,
            needsRedraw: true,
            activePinIdx: -1,
            Pins: this._createPins(this._gameConfig.keyPins),
            Win: false
        }

        this.activateNextPin();

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

    _createPins(pinConfig) {
        const pinStates = [];

        pinConfig.forEach(p => {
            /** @type {PinInfo} */
            const pinInfo = {
                Width: p.widthDeg * Math.PI / 180,
                Angle: p.startDeg * Math.PI / 180,
                CutAngle: p.startDeg * Math.PI / 180,
                Radius: p.depthPx,
                Inserted: false
            }

            pinStates.push(pinInfo);
        });

        return pinStates;
    }

     /**
     * Inserts pin into cut
     * 
     * @param {PinInfo} pinInfo
     */
    insertPin(pinInfo) {
        pinInfo.Inserted = true;
        this.invalidateAll();
    }

    activateNextPin() {
        const activePinIdx = this._currentState.activePinIdx;
        const numPins = this._currentState.Pins.length;

        if (numPins > 0) {
            if (activePinIdx == -1) {
                this._currentState.activePinIdx = 0;
            }
            else if (this._currentState.activePinIdx + 1 < numPins) {
                this._currentState.activePinIdx++;
            }
            else {
                this._currentState.activePinIdx = -1;
            }
        }
        else {
            this._currentState.activePinIdx = -1;
        }

        this.invalidateAll();
    }

    areAllPinsInserted() {
        return this._currentState.Pins.every(p => p.Inserted);
    }

    get PinDeltaAngle() {
        return this._currentState.pinDeltaAngle;
    }
    set PinDeltaAngle(dTheta) {
        this._currentState.pinDeltaAngle = dTheta;
        this.invalidateAll();
    }

    get ActivePin() {
        return this._currentState.Pins[this._currentState.activePinIdx];
    }

    get TumblerAngle() {
        return this._currentState.tumblerAngle;
    }
    set TumblerAngle(v) {
        this._currentState.tumblerAngle = v;
        this.invalidateAll();
    }

    get Win() {
        return this._currentState.Win;
    }

    set Win(v) {
        if (this._currentState.Win != v) {
            this._currentState.Win = v;
            this.invalidateAll(); // TODO: only invalidate if value changes (for all state values)
        }
    }
}