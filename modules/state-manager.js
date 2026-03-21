/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").KeyboardState} KeyboardState */

//
// state manager
//

class StateManager {
    /**
     * Creates New State
     * 
     * @param {Config} gameConfig 
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

    nextPin(state) {
        return state.pinIterator.next().value;
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

    createKeyboardState() {
        /** @type {KeyboardState} */
        const keyboardState = {
            leftKeyDown: false,
            rightKeyDown: false,
            upKeyDown: false,
            downKeyDown: false,
            lastLeftKeyPress: 0,
            lastRightKeyPress: 0,
            lastUpKeyPress: 0,
            lastDownKeyPress: 0 };

        return keyboardState;
    }
}

export { StateManager }