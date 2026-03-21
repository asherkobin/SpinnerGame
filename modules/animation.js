import { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler } from "./draw.js";
import { drawScratches, drawSpots, drawCylinder, drawPins, drawButtonPanel } from "./draw.js"

class transitionManager {
    _transitionList = [];

    _normalizeAngle(a) {
        const tau = 2 * Math.PI;
        if (a > tau) {
            a = ((a % tau) + tau) % tau;
        }
        return a;
    };

    createLinearTransiton(updateFn, startValue, targetValue, durationTime, completionFn) { 
        const linearTransition = {
            updateFn: updateFn,
            startValue: startValue,
            targetValue: targetValue,
            durationTime: durationTime,
            startTime: 0,
            endTime: 0,
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
            startTime: 0,
            endTime: 0,
            completionProgress: 0,
            isCompleted: false,
            completionFn: null,
            currentValue: startValue,
            actualEndTime: 0,
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

    handleTimeChange(timeStamp) {
        this._transitionList.forEach(t => {
            if (!t.isCompleted) {
                if (t.startTime == 0) {
                    t.startTime = timeStamp;

                    if (t.durationTime != 0) {
                        t.endTime = t.startTime + t.durationTime;
                    }
                }

                const deltaTime = timeStamp - t.startTime;
                const durationTime = t.endTime - t.startTime;

                // infinite
                if (t.endTime == 0) {
                    if (t.angularVelocity != 0) {
                        const n = t.startValue + (t.angularVelocity * deltaTime);

                        t.previousValue = t.currentValue;
                        t.currentValue = this._normalizeAngle(n);
                    }
                    else if (t.linearVelocity > 0) {
                        console.log("NYI");
                    }

                    t.updateFn(t.currentValue);
                }
                // time expired
                else if (timeStamp >= t.endTime) {
                    t.actualEndTime = timeStamp;
                    t.completionProgress = 1;
                    t.previousValue = t.currentValue;
                    t.currentValue = t.targetValue;
                    t.isCompleted = true;
                    
                    t.updateFn(t.currentValue);
                    t.completionFn();
                }
                // linear increment
                else {
                    t.completionProgress = deltaTime / durationTime;
                    t.previousValue = t.currentValue;
                    t.currentValue = t.targetValue * t.completionProgress;

                    t.updateFn(t.currentValue);
                }
            }
        });
    };
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
        handleRotation,
        handleDrawFrame,
        handlePinInsertion,
        handleWinCondition
    ],
    
    animationLoop: function(timeStamp) {
        this._ctx.s.timeStamp = timeStamp;
        this._ctx.s.deltaTime = timeStamp - this._ctx.s.lastTime;
        this._ctx.s.lastTime = timeStamp; 

        for (const stateHandler of this.stateHandlers) {
            stateHandler(this._ctx);
        }

        this._ctx.tm.handleTimeChange(timeStamp);

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
    if (ctx.a.nudgePinL) {
        ctx.a.nudgePinL = false;
        deltaChange = 0.005;
    }
    else if (ctx.a.nudgePinR) {
        ctx.a.nudgePinR = false;
        deltaChange = -0.005;
    }
    else if (ctx.a.movePinL) {
        ctx.movePinL = false;
        deltaChange = 0.01;
    }
    else if (ctx.a.movePinR) {
        ctx.movePinR = false;
        deltaChange = -0.01;
    }
    else if (ctx.a.tryInsertPin) {
        ctx.a.tryInsertPin = false;
        return handlePinInsertionAttempt(ctx);
    }
    else if (ctx.a.startTumbler) {
        ctx.a.startTumbler = false;
        
        ctx.s.ttid = ctx.tm.createRotatingTransiton(
            (v) => { ctx.s.tumblerAngle = v; ctx.s.needsRedraw = true; },
            ctx.s.tumblerAngle,
            ctx.g.tumblerVelocity);

        ctx.l.buttonInfo[1].text = "Stop"; // FIXME
        ctx.f.startRotationLoop();
        needsRedraw = true;
    }
    else if (ctx.a.stopTumbler) {
        ctx.a.stopTumbler = false;
        
        ctx.tm.stopAndRemove(ctx.s.ttid);

        ctx.l.buttonInfo[1].text = "Start"; // FIXME
        ctx.f.stopRotationLoop();
        needsRedraw = true;
    }
    else if (ctx.a.rotateOnce) {
        ctx.a.rotateOnce = false;
        ctx.s.tumblerTargetAngle += (2 * Math.PI);
        ctx.a.startTumblerToTargetAngle = true;
    }
    else if (ctx.a.rotateNudge) {
        //ctx.s.tumblerTargetAngle += (2 * Math.PI) / 8; // TODO: randomize for higher difficulty
        ctx.a.rotateNudge = false;
        ctx.a.startTumblerToTargetAngle = true;
    }

    if (deltaChange != 0) { // FIXME console
        ctx.f.playNudge();
        ctx.s.keyPinAngleChange = deltaChange * Math.PI * 2;
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

function handleRotation(ctx) {
    const state = ctx.s;
    const current = state.tumblerVelocity;
    const target = state.tumblerTargetVelocity;

    // accelerate toward target velocity
    if (current < target) {
        // speed up, but not beyond target
        ctx.s.tumblerVelocity = Math.min(target,
            current + (ctx.g.tumblerAcceleration * ctx.s.deltaTime));
    }
    else if (current > target) {
        // slow down
        ctx.s.tumblerVelocity *= ctx.g.tumblerFriction;
    }

    if (ctx.s.tumblerVelocity > 0) {
        // stop when very slow
        if (ctx.s.tumblerVelocity < 0.00001) {
            ctx.s.tumblerVelocity = 0;
        }
        // update angle for drawing
        ctx.s.tumblerAngle += ctx.s.tumblerVelocity * ctx.s.deltaTime;

            // null means no target angle, 0 is a valid angle to rotate to

        if (ctx.s.tumblerTargetAngle != null && ctx.s.tumblerAngle >= ctx.s.tumblerTargetAngle) {
            ctx.f.stopRotationLoop();
            ctx.s.tumblerAngle = ctx.s.tumblerTargetAngle;
            ctx.a.stopTumbler = true;
        }

        ctx.requestRedraw();
    }
}

function handleWinCondition(ctx) {
    if (!ctx.s.allPinsInserted) {
        const allPinsInserted = ctx.s.pinStates.every(p => p.i);

        if (allPinsInserted && ctx.s.pinStates.length > 0) {
            ctx.a.rotateOnce = true; // FIXME: already partially rotated
            ctx.s.allPinsInserted = true;
            return true;
        }
    }

    return false;
}

function handlePinInsertion(ctx) {
    if (ctx.s.wasInserted) {
        ctx.s.activePin = ctx.s.pinIterator.next().value;
        ctx.s.wasInserted = false;
        
        return true;
    }

    return false;
}

function handleNudgePlug(ctx) {
    ctx.s.plugAngle = 0;
    ctx.s.plugTargetAngle = Math.PI / 8;
    ctx.s.plugAngleDir = 1;
    ctx.a.nudgePlug = false;

    return true;
}

function handlePinInsertionAttempt(ctx) {
    function isKeyPinInCut (keyPinAngle, tumblerAngle, matchTolerance) {
        let angleDistance = keyPinAngle - tumblerAngle;
        angleDistance = (angleDistance + Math.PI) % (Math.PI * 2);
        if (angleDistance < 0)
            angleDistance += Math.PI * 2;
        angleDistance = angleDistance - Math.PI;

        return (Math.abs(angleDistance) < matchTolerance);
    }
    
    if (ctx.s.activePin) {
        if (ctx.s.activePin.i) {
            console.log("PIN ALREADY INSERTED");
        }
        else {
            const canInsert = isKeyPinInCut(
                ctx.s.activePin.a,
                ctx.s.tumblerAngle + ctx.s.activePin.ca,
                ctx.g.matchTolerance);
            ctx.s.activePin.i = canInsert;

            ctx.s.activePin.a = canInsert ? ctx.s.tumblerAngle : ctx.s.activePin.a; // align if inserted
            
            ctx.s.wasInserted = canInsert;

            if (!canInsert) {
                ctx.f.playError();
                //ctx.a.rotateNudge = true; // mean!! - maybe rotate the other way
            }
            else if (ctx.s.wasInserted) {
                ctx.f.playInsert();
                
                ctx.a.nudgePlug = true;
                //ctx.a.rotateNudge = true; // TODO: Make difficulty setting
            }

            return ctx.s.wasInserted;
        }
    }

    return false;
}

function handleKeyPress(ctx) {
    let timeDelta = 0;
    
    // LEFT KEY
    if (ctx.k.leftKeyDown) {
        if  (ctx.k.lastLeftKeyPress == 0) {
            ctx.k.lastLeftKeyPress = ctx.s.lastTime;
        }

        timeDelta = ctx.s.lastTime - ctx.k.lastLeftKeyPress;

        if (timeDelta == 0) {
            ctx.a.nudgePinL = true;
        }
        else if (timeDelta < 250) {
            // pause
        }
        else {
            ctx.a.movePinL = true;
        }
    }
    else if (ctx.k.lastLeftKeyPress > 0) {
        timeDelta = ctx.s.lastTime - ctx.k.lastLeftKeyPress;
    
        if (timeDelta < 250) {
        // console.log("Short Press")
        }
        else {
        // console.log("Long Press")
        }

        ctx.k.lastLeftKeyPress = 0;
    }

    // RIGHT KEY
    if (ctx.k.rightKeyDown) {
        if  (ctx.k.lastRightKeyPress == 0) {
            ctx.k.lastRightKeyPress = ctx.s.lastTime;
        }

        timeDelta = ctx.s.lastTime - ctx.k.lastRightKeyPress;

        if (timeDelta == 0) {
            ctx.a.nudgePinR = true;
        }
        else if (timeDelta < 250) {
            // pause
        }
        else {
            ctx.a.movePinR = true;
        }
    }
    else if (ctx.k.lastRightKeyPress > 0) {
        timeDelta = ctx.s.lastTime - ctx.k.lastRightKeyPress;
    
        if (timeDelta < 250) {
        // console.log("Short Press")
        }
        else {
        // console.log("Long Press")
        }

        ctx.k.lastRightKeyPress = 0;
    }

    // UP KEY
    if (ctx.k.upKeyDown) {
        if  (ctx.k.lastUpKeyPress == 0) {
            ctx.k.lastUpKeyPress = ctx.s.lastTime;
        }

        timeDelta = ctx.s.lastTime - ctx.k.lastUpKeyPress;

        if (timeDelta == 0) {
            ctx.a.tryInsertPin = true;
        }
    }
    else if (ctx.k.lastUpKeyPress > 0) {
        ctx.k.lastUpKeyPress = 0;
    }
}

export { animationHandler };