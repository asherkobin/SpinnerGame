/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").Layout} Layout */
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
    constructor(gameConfig, uiLayout) {
        /** @type {Config} */
        this._gameConfig = gameConfig;
        /** @type {Layout} */
        this._uiLayout = uiLayout;
        
        this.loadFromConfig();
    }

    _updateRegions = [1];

    loadFromConfig() {
        /** @type {State} */
        this._currentState = {
            tumblerAngle: 0,
            lastTime: 0,
            lastLeftKeyDown: 0,
            lastRightKeyDown: 0,
            allPinsInserted: false,
            plugAngle: 0,
            needsRedraw: true,
            activePinIdx: -1,
            Pins: this._createPins(this._gameConfig.keyPins),
            winConditionMet: false,
            previousAttemptWasFail: false
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
            const pinInfo = {};
            
            pinInfo.Engaged = false,
            pinInfo.RadiusOpen = this._uiLayout.tumblerRadius + this._uiLayout.tumblerSpacing,
            pinInfo.RadiusEngaged = 0;
            pinInfo.SweepAngle = p.widthDeg * Math.PI / 180;
            pinInfo.RadialWidth = p.depthPx;
            pinInfo.Radius = pinInfo.Engaged ? pinInfo.RadiusEngaged : pinInfo.RadiusOpen;
            pinInfo.StartAngle = p.startDeg * Math.PI / 180;
            pinInfo.CutAngle = pinInfo.StartAngle;
            pinInfo.CutDepth = this._uiLayout.tumblerRadius - pinInfo.RadialWidth;

            pinStates.push(pinInfo);
        });

        return pinStates;
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

    engageActivePin() {
        const activePin = this._currentState.Pins[this._currentState.activePinIdx];
        
        activePin.StartAngle = activePin.CutAngle;
        activePin.Engaged = true;
    }

    areAllPinsEngaged() {
        return this._currentState.Pins.every(p => p.Engaged);
    }

    set PinDeltaAngle(dTheta) {
        if (dTheta != 0) {
            this._currentState.Pins.forEach(p => {
                p.StartAngle += dTheta;
            });
        
            this.invalidateAll();
        }
    }

    /**
     * @returns {string}
     */
    get ActivePinStatus() {
        if (this._currentState.activePinIdx == -1) {
            return "none";
        }
        else if (this._currentState.Pins[this._currentState.activePinIdx].Engaged) {
            return "engaged";
        }
        else {
            return "open";
        }
    }

    get ActivePinAngle() {
        return this._currentState.Pins[this._currentState.activePinIdx].StartAngle;
    }
    get ActivePinCutAngle() {
        return this._currentState.Pins[this._currentState.activePinIdx].CutAngle;
    }
    get ActivePinCutDepth() {
        return this._currentState.Pins[this._currentState.activePinIdx].CutDepth;
    }
    get ActivePinDistance() {
        return this._currentState.Pins[this._currentState.activePinIdx].Radius;
    }
    set ActivePinDistance(v) {
        this._currentState.Pins[this._currentState.activePinIdx].Radius = v;
        this.invalidateAll();
    }

    get TumblerAngle() {
        return this._currentState.tumblerAngle;
    }
    set TumblerAngle(v) {
        this._currentState.tumblerAngle = v;
        this.invalidateAll();
    }

    get PlugAngle() {
        return this._currentState.plugAngle;
    }
    set PlugAngle(v) {
        this._currentState.plugAngle = v;
        this.invalidateAll();
    }

    get Win() {
        return this._currentState.winConditionMet;
    }

    set Win(v) {
        if (this._currentState.winConditionMet != v) {
            this._currentState.winConditionMet = v;
            this.invalidateAll(); // TODO: only invalidate if value changes (for all state values)
        }
    }

    get PreviousAttemptWasFail() {
        return this._currentState.previousAttemptWasFail;
    }
    set PreviousAttemptWasFail(v) {
        this._currentState.previousAttemptWasFail = v;
        this.invalidateAll();
    }
}