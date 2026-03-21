import { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler } from "./draw.js";
import { drawScratches, drawSpots, drawCylinder, drawPins, drawButtonPanel } from "./draw.js"

class transitionManager {
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

//
// main animation loop and various handlers
//

const animationHandler = {
    startAnimationLoop: function(ctx) {
        ctx.tm = new transitionManager();
        
        this._ctx = ctx;
        this._ctx.s.lastTime = 0;
        this._animationLoopCallback = this.animationLoop.bind(this);
        this._ctx.s.needsRedraw = true;

        window.requestAnimationFrame(this._animationLoopCallback)
    },

    stateHandlers: [
        handleKeyPress,
        handleActions,
        handleReset,
        handleDrawFrame,
        handlePinInsertion,
        handleWinCondition
    ],
    
    animationLoop: function(timeStamp) {
        const deltaTime = timeStamp - this._ctx.s.lastTime;
        
        this._ctx.s.lastTime = timeStamp; 

        for (const stateHandler of this.stateHandlers) {
            stateHandler(this._ctx);
        }

        this._ctx.tm.handleTimeChange(deltaTime);

        if (this._ctx.s.needsRedraw) {
            this._drawFrame();
            this._ctx.s.needsRedraw = false;
        }
        
        window.requestAnimationFrame(this._animationLoopCallback);
    },

    _drawFrame: function() {
        drawBackground(this._ctx);
        drawTitlePanel(this._ctx);
        drawStatusBox(this._ctx);
        drawTumbler(this._ctx);
        drawScratches(this._ctx);
        drawSpots(this._ctx);
        drawCylinder(this._ctx);
        drawPins(this._ctx)
        drawButtonPanel(this._ctx);
    }
}

function handleActions(ctx) {
    let needsRedraw = false;
    let deltaChange = 0;

    // checks the ctx.a flags and changes state if needed

    if (ctx.a.nudgePlug) {
        ctx.a.nudgePlug = false;
        needsRedraw |= handleNudgePlug(ctx);
    }
    
    
    
    else if (ctx.a.rotateNudge) {
        //ctx.s.tumblerTargetAngle += (2 * Math.PI) / 8; // TODO: randomize for higher difficulty
        ctx.a.rotateNudge = false;
        ctx.a.startTumblerToTargetAngle = true;
    }

    if (deltaChange != 0) { // FIXME console
        
        //ctx.s.keyPinAngleChange = deltaChange * Math.PI * 2;
        needsRedraw = true;
    }

    if (needsRedraw) {
        ctx.requestRedraw();
    }
}

function handleReset(ctx) {
    if (ctx.a.resetGame) {
        ctx.a.resetGame = false;
        ctx.f.stopAll();
        ctx.l.buttonInfo[1].text = "Start"; // FIXME
        //ctx.a.cancelAllActions(); // NYI
        ctx.s = ctx.sm.createNewState(ctx.g);
        return true;
    }

    return false;
}

function handleDrawFrame(ctx) {
    if (ctx.s.plugTargetAngle) {
        const deltaChange = 0.03; // speed
        if (ctx.s.plugTargetAngle > 0) {
            ctx.s.plugAngle += (ctx.s.plugAngleDir * deltaChange);

            if (ctx.s.plugAngle >= ctx.s.plugTargetAngle) {
                // reverse direction
                ctx.s.plugTargetAngle = -ctx.s.plugTargetAngle;
                ctx.s.plugAngleDir = -1;
            }
            
            return true;
        }
        else if (ctx.s.plugTargetAngle < 0) {
            ctx.s.plugAngle += (ctx.s.plugAngleDir * deltaChange);

            if (ctx.s.plugAngle <= ctx.s.plugTargetAngle) {
                // return to 0, in dir = 1, but stop then
                ctx.s.plugAngle = 0;
                ctx.s.plugTargetAngle = null;
            }

            return true;
        }
    }

    return false;
}

function handleWinCondition(ctx) {
    if (!ctx.s.allPinsInserted) {
        const allPinsInserted = ctx.s.pinStates.every(p => p.i);

        if (allPinsInserted && ctx.s.pinStates.length > 0) {
            ctx.a.rotateOnce();
            ctx.s.allPinsInserted = true;
        }
    }
}

function handlePinInsertion(ctx) {
    if (ctx.s.wasInserted) {
        ctx.s.activePin = ctx.s.pinIterator.next().value;
        ctx.s.wasInserted = false;
    }
}

function handleNudgePlug(ctx) {
    ctx.s.plugAngle = 0;
    ctx.s.plugTargetAngle = Math.PI / 8;
    ctx.s.plugAngleDir = 1;
    ctx.a.nudgePlug = false;

    return true;
}

function handleKeyPress(ctx) {
    let timeDelta = 0;
    
    if (ctx.k.leftKeyDown) {
        if  (ctx.k.lastLeftKeyPress == 0) {
            ctx.k.lastLeftKeyPress = ctx.s.lastTime;
        }

        timeDelta = ctx.s.lastTime - ctx.k.lastLeftKeyPress;

        if (timeDelta >= 0 && timeDelta < 250) {
            ctx.a.movePinDirect(0.005); // TODO: These values need to based on timeDelta
        }
        else if (timeDelta >= 250 && timeDelta < 500) {
            ctx.a.movePinDirect(0.010);
        }
        else {
            ctx.a.movePinDirect(0.050);
        }
    }
    else if (ctx.k.lastLeftKeyPress > 0) {
        timeDelta = ctx.s.lastTime - ctx.k.lastLeftKeyPress;

        ctx.s.pinDeltaAngle = 0; // FIXME
    
        if (timeDelta < 250) {
        }
        else {
        }

        ctx.k.lastLeftKeyPress = 0;
    }

    if (ctx.k.rightKeyDown) {
        if  (ctx.k.lastRightKeyPress == 0) {
            ctx.k.lastRightKeyPress = ctx.s.lastTime;
        }

        timeDelta = ctx.s.lastTime - ctx.k.lastRightKeyPress;

        if (timeDelta >= 0 && timeDelta < 250) {
            ctx.a.movePinDirect(-0.005); // TODO: These values need to based on timeDelta
        }
        else if (timeDelta >= 250 && timeDelta < 500) {
            ctx.a.movePinDirect(-0.010);
        }
        else {
            ctx.a.movePinDirect(-0.050);
        }
    }
    else if (ctx.k.lastRightKeyPress > 0) {
        timeDelta = ctx.s.lastTime - ctx.k.lastRightKeyPress;

        ctx.s.pinDeltaAngle = 0; // FIXME
    
        if (timeDelta < 250) {
        }
        else {
        }

        ctx.k.lastRightKeyPress = 0;
    }

    if (ctx.k.upKeyDown) {
        if  (ctx.k.lastUpKeyPress == 0) {
            ctx.k.lastUpKeyPress = ctx.s.lastTime;
        }

        timeDelta = ctx.s.lastTime - ctx.k.lastUpKeyPress;

        if (timeDelta == 0) {
            ctx.a.tryInsertPin();
        }
    }
    else if (ctx.k.lastUpKeyPress > 0) {
        ctx.k.lastUpKeyPress = 0;
    }
}

export { animationHandler };