import { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler } from "./draw.js";
import { drawScratches, drawSpots, drawCylinder, drawPins, drawButtonPanel } from "./draw.js"

//
// main animation loop and various handlers
//

const animationHandler = {
    startAnimationLoop: function(ctx) {
        this.__ctx = ctx;
        this.__ctx.s.lastTime = 0;
        this.__animationLoopCallback = this.animationLoop.bind(this);

        this.__animationLoopCallback(0);
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
        this.__ctx.s.timeStamp = timeStamp;
        this.__ctx.s.deltaTime = timeStamp - this.__ctx.s.lastTime;
        this.__ctx.s.lastTime = timeStamp; 

        let needsRedraw = (timeStamp == 0);

        for (const stateHandler of this.stateHandlers) {
            if (stateHandler(this.__ctx)) {
                needsRedraw = true;
            }
        }

        if (needsRedraw) {
            this.__drawFrame();
        }
        
        window.requestAnimationFrame(this.__animationLoopCallback);
    },

    __drawFrame: function() {
        drawBackground(this.__ctx);
        drawTitlePanel(this.__ctx);
        drawStatusBox(this.__ctx);
        drawTumbler(this.__ctx);
        drawScratches(this.__ctx);
        drawSpots(this.__ctx);
        drawCylinder(this.__ctx);
        drawPins(this.__ctx)
        drawButtonPanel(this.__ctx);
    }
}

function handleActions(ctx) {
    let needsRedraw = false;
    let deltaChange = 0;

    // checks the ctx.a flags and changes state if needed

    if (ctx.a.nudgePlug) {
        needsRedraw |= handleNudgePlug(ctx);
    }
    if (ctx.a.nudgePinL) {
        deltaChange = 0.005;
    }
    else if (ctx.a.nudgePinR) {
        deltaChange = -0.005;
    }
    else if (ctx.a.movePinL) {
        deltaChange = 0.01;
    }
    else if (ctx.a.movePinR) {
        deltaChange = -0.01;
    }
    else if (ctx.a.tryInsertPin) {
        return handlePinInsertionAttempt(ctx);
    }
    else if (ctx.a.startTumbler) {
        ctx.s.tumblerTargetAngle = null;
        ctx.s.tumblerTargetVelocity = ctx.g.tumblerVelocity;
        ctx.l.buttonInfo[1].text = "Stop"; // FIXME
        ctx.a.startTumbler = false;
        ctx.f.startRotationLoop();
        needsRedraw = true;
    }
    else if (ctx.a.startTumblerToTargetAngle) {
        ctx.s.tumblerTargetVelocity = ctx.g.tumblerVelocity;
        ctx.l.buttonInfo[1].text = "Stop"; // FIXME
        ctx.a.startTumblerToTargetAngle = false;
        ctx.f.startRotationLoop();
        needsRedraw = true;
    }
    else if (ctx.a.stopTumbler) {
        ctx.s.tumblerVelocity = 0;
        ctx.s.tumblerTargetVelocity = 0;
        ctx.l.buttonInfo[1].text = "Start"; // FIXME
        ctx.a.stopTumbler = false;
        ctx.f.stopRotationLoop();
        needsRedraw = true;
    }
    else if (ctx.a.rotateOnce) {
        ctx.s.tumblerTargetAngle += (2 * Math.PI);
        ctx.a.rotateOnce = false;
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
        ctx.a.nudgePinL = false;
        ctx.a.nudgePinR = false;
        ctx.a.movePinL = false;
        ctx.a.movePinR = false;
        needsRedraw = true;
    }

    return needsRedraw;
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

        return true;
    }

    return false;
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

    ctx.a.tryInsertPin = false;
    
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