import { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler } from "./canvas.js";
import { drawScratches, drawSpots, drawCylinder, drawPins, drawButtonPanel } from "./canvas.js"

//
// main animation loop and various handlers
//

export default class RenderManager {
    constructor(ctx) {
        this._ctx = ctx;
    }
    startLoop(ctx) {
        this._ctx = ctx;
        this._ctx.s.lastTime = 0;
        this._animationLoopCallback = this.animationLoop.bind(this);
        this._ctx.s.needsRedraw = true;

        window.requestAnimationFrame(this._animationLoopCallback)
    }

    stateHandlers = [
        this.handleKeyPress,
        this.handleActions,
        this.handleDrawFrame,
        this.handlePinInsertion,
        this.handleWinCondition ];
    
    animationLoop(timeStamp) {
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
    }

    _drawFrame() {
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

    handleActions(ctx) {
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

    handleDrawFrame(ctx) {
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

    handleWinCondition(ctx) {
        if (!ctx.s.allPinsInserted) {
            const allPinsInserted = ctx.s.pinStates.every(p => p.i);

            if (allPinsInserted && ctx.s.pinStates.length > 0) {
                ctx.a.rotateOnce();
                ctx.s.allPinsInserted = true;
            }
        }
    }

    handlePinInsertion(ctx) {
        if (ctx.s.wasInserted) {
            ctx.s.activePin = ctx.s.pinIterator.next().value;
            ctx.s.wasInserted = false;
        }
    }

    handleNudgePlug(ctx) {
        ctx.s.plugAngle = 0;
        ctx.s.plugTargetAngle = Math.PI / 8;
        ctx.s.plugAngleDir = 1;
        ctx.a.nudgePlug = false;

        return true;
    }

    handleKeyPress(ctx) {
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
}