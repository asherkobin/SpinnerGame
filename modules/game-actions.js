export default class GameActions {
    setContext(ctx) { // FIXME
        this._ctx = ctx;
    }
    
    fromCommand(cmd) {
        switch (cmd) {
            case "Connect":
                // BLE HERE this.connectToController();
                break;
            case "Start":
                this.startTumbler()
                break;
            case "Stop":
                this.stopTumbler()
                break;
            case "...":
                this.resetGame();
                break;
        }
    }
    resetGame() {
        this._ctx.f.stopAll();
        this._ctx.l.buttonInfo[1].text = "Start"; // FIXME
        this._ctx.tm.removeAll();
        this._ctx.s = this._ctx.sm.createNewState(this._ctx.g);
    }
    startTumbler() {
        this._ctx.s.ttid = this._ctx.tm.createRotatingTransiton(
            (v) => { this._ctx.s.tumblerAngle = v; this._ctx.s.needsRedraw = true; },
            this._ctx.s.tumblerAngle,
            this._ctx.g.tumblerVelocity);

        this._ctx.l.buttonInfo[1].text = "Stop"; // FIXME
        this._ctx.f.startRotationLoop();
    }
    stopTumbler() {
        this._ctx.tm.stopAndRemove(this._ctx.s.ttid);
        this._ctx.l.buttonInfo[1].text = "Start"; // FIXME
        this._ctx.f.stopRotationLoop();
    }
    movePin(deltaAngle) {xxx
        this._ctx.tm.createLinearTransiton(
            (v) => { this._ctx.s.keyPinAngle = v; this._ctx.s.needsRedraw = true; },
            this._ctx.s.keyPinAngle,
            this._ctx.s.keyPinAngle + deltaAngle,
            250);
    }
    movePinDirect(deltaAngle) {
        this._ctx.s.pinDeltaAngle = deltaAngle;
        this._ctx.s.needsRedraw = true;
    }
    rotateOnce() {
        this._ctx.tm.createLinearTransiton(
            (v) => { this._ctx.s.tumblerAngle = v; this._ctx.s.needsRedraw = true;},
            this._ctx.s.tumblerAngle,
            this._ctx.s.tumblerAngle + 2 * Math.PI,
            2000,
            () => { console.log("rotateOnce complete"); });
    }
    tryInsertPin() {
        function isKeyPinInCut (keyPinAngle, tumblerAngle, matchTolerance) {
            let angleDistance = keyPinAngle - tumblerAngle;
            angleDistance = (angleDistance + Math.PI) % (Math.PI * 2);
            if (angleDistance < 0)
                angleDistance += Math.PI * 2;
            angleDistance = angleDistance - Math.PI;

            return (Math.abs(angleDistance) < matchTolerance);
        }

        const state = this._ctx.s;
        const config = this._ctx.g;
        const activePin = state.activePin;
        const sfx = this._ctx.f;
    
        if (state.activePin) {
            if (state.activePin.i) {
                console.log("PIN ALREADY INSERTED");
            }
            else {
                const canInsert = isKeyPinInCut(
                    activePin.a,
                    state.tumblerAngle + activePin.ca,
                    config.matchTolerance);
                
                activePin.i = canInsert;
                activePin.a = canInsert ? state.tumblerAngle : activePin.a; // align if inserted
                
                state.wasInserted = canInsert;

                if (!canInsert) {
                    sfx.playError();
                }
                else if (state.wasInserted) {
                    sfx.playInsert();
                }

                state.needsRedraw = true;;
            }
        }
    }
}