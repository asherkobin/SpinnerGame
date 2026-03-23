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
        this._ctx.s = this._ctx.sm.createStateFromConfig(this._ctx.g);
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
    animatePin(deltaAngle) {
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
    shakeKeyPlug() {
        this._ctx.tm.createLinearTransiton(
            (v) => { this._ctx.s.plugAngle = v; this._ctx.s.needsRedraw = true;},
            this._ctx.s.plugAngle,
            this._ctx.s.plugAngle + 2 * Math.PI / 64,
            100,
            () => this._ctx.tm.createLinearTransiton(
                (v) => { this._ctx.s.plugAngle = v; this._ctx.s.needsRedraw = true;},
                this._ctx.s.plugAngle,
                this._ctx.s.plugAngle - 4 * Math.PI / 64,
                200,
                () => this._ctx.tm.createLinearTransiton(
                    (v) => { this._ctx.s.plugAngle = v; this._ctx.s.needsRedraw = true;},
                    this._ctx.s.plugAngle,
                    this._ctx.s.plugAngle + 2 * Math.PI / 64,
                    100)));
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
        const sm = this._ctx.sm;
    
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
                
                if (canInsert) {
                    sfx.playInsert();
                    state.activePin = sm.nextPin(state);

                    if (state.activePin) {
                        this.shakeKeyPlug();
                    }
                    else {
                        // AKA allPinsInserted
                    }
                }
                else {
                    sfx.playError();
                }

                state.needsRedraw = true;;
            }
        }
    }
}