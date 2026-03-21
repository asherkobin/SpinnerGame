//
// transition manager
//

export default class TransitionManager {
    _transitionList = [];
    _pendingTransitions = [];

    _normalizeAngle(a) {
        const tau = 2 * Math.PI;
        return ((a % tau) + tau) % tau;
    };

    createLinearTransiton(updateFn, startValue, targetValue, durationTime, completionFn) { 
        const linearTransition = {
            updateFn: updateFn,
            startValue: startValue,
            targetValue: targetValue,
            durationTime: durationTime,
            elapsedTime: 0,
            completionProgress: 0,
            isCompleted: false,
            completionFn: completionFn,
            currentValue: startValue,
            actualEndTime: 0,
            linearVelocity: 0,
            angularVelocity: 0,
            previousValue: 0,
            __uid: crypto.randomUUID
        };

        this._transitionList.push(linearTransition);

        return linearTransition.__uid;
    };

    createRotatingTransiton(updateFn, startValue, radiansPerMillisecond) {
        const rotatingTransition = {
            updateFn: updateFn,
            startValue: startValue,
            targetValue: 0,
            durationTime: 0,
            elapsedTime: 0,
            completionProgress: 0,
            isCompleted: false,
            completionFn: null,
            currentValue: startValue,
            linearVelocity: 0,
            angularVelocity: radiansPerMillisecond,
            previousValue: 0,
            __uid: crypto.randomUUID
        };

        this._transitionList.push(rotatingTransition);

        return rotatingTransition.__uid;
    };

    removeAll() {
        this._transitionList.length = 0;
        this._pendingTransitions.length = 0;
    }

    stopAndRemove(tid) {
        const t = this._transitionList.find(t => t.__uid === tid);

        this._transitionList = this._transitionList.filter(i => i.__uid !== tid);
    }

    handleTimeChange(deltaTime) {
        this._transitionList.forEach(t => {
            if (!t.isCompleted) {
                // infinite
                if (t.durationTime == 0) {
                    if (t.angularVelocity) {
                        t.previousValue = t.currentValue;
                        t.currentValue = this._normalizeAngle(t.currentValue + (t.angularVelocity * deltaTime));
                    }
                    else if (t.linearVelocity) {
                        console.log("NYI");
                    }

                    t.updateFn(t.currentValue);
                }
                // linear increment
                else {
                    t.previousValue = t.currentValue;
                    t.elapsedTime += deltaTime;
                    t.completionProgress = Math.min(t.elapsedTime / t.durationTime, 1);

                    if (t.completionProgress == 1) {
                        t.currentValue = t.targetValue;
                        t.isCompleted = true;
                    }
                    else {
                        t.currentValue = t.startValue + (t.targetValue - t.startValue) * t.completionProgress;
                    }

                    t.updateFn(t.currentValue);

                    if (t.isCompleted && t.completionFn) {
                        // during completionFn new transitions will be added to _pendingTransitions
                        t.completionFn();
                    }
                }
            }
        });

        this._transitionList = this._transitionList.filter(t => !t.isCompleted);
        this._transitionList.push(...this._pendingTransitions);
        this._pendingTransitions.length = 0;
    }
}