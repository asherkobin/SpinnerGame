//
// state manager
//

export default class StateManager {
    createNewState(gameConfig) {
        const newState = {
            tumblerAngle: 0,
            tumblerTargetAngle: 0,
            lastTime: 0,
            tumblerTargetVelocity: 0,
            tumblerVelocity: 0,
            pinDeltaAngle: 0,
            wasInserted: false,
            pinStates: this._initPinStates(gameConfig.keyPins),
            lastLeftKeyDown: 0,
            lastRightKeyDown: 0,
            allPinsInserted: false,
            plugAngle: 0,
            plugTargetAngle: 0,
            allPinsInserted: false,
            needsRedraw: true,
        }

        newState.pinIterator = newState.pinStates.values();
        newState.activePin = newState.pinIterator.next().value;

        return newState;
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