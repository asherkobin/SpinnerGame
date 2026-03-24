/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").UserInputState} UserInputState */
/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").Layout} Layout */

import StateManager from "./state-manager.js";
import SoundFactory from "./sound-factory.js";

export default class GameLogicHelper {
    /**
     * Game Logic
     * 
     * @param {StateManager} stateManager
     * @param {Config} currentConfig
     * @param {Layout} currentLayout
     * @param {SoundFactory} soundFactory
     */
    constructor (stateManager, currentConfig, currentLayout, soundFactory) {
        /** @type {StateManager} */
        this._stateManager = stateManager;
        /** @type {Config} */
        this._currentConfig = currentConfig;
        /** @type {Layout} */
        this._currentLayout = currentLayout;
        /** @type {SoundFactory} */
        this._soundFactory = soundFactory;
    }
    
    /**
     * Generates a command based on user input.
     * 
     * @param {UserInputState} userInput
     * @param {number} dT
     */
    _transformInputToCommand(userInput, dT) {
        const buttonInfo = this._objectFromPoint(userInput.pointerX, userInput.pointerY);

        if (userInput.pointerClick != "none") {
            console.log("button: " + buttonInfo);
        }
    }

    /** @returns {object} */
    _objectFromPoint(x, y) {
        // search for button
        const foundButton = this._currentLayout.buttonInfo.find(b => {
            const bx = this._currentLayout.bpx + b.x;
            const by = this._currentLayout.bpy + b.y;
            const bw = b.w;
            const bh = this._currentLayout.bh;
            const pointInButton = x >= bx && x <= bx + bw && y >= by && y <= by + bh;

            return pointInButton;
        });
    }

    /**
     * Main entry-point that calls StateManager based on user input and time change.
     * 
     * @param {UserInputState} userInput
     * @param {number} dT
     */
    updateGameState(userInput, dT)
    {
        this._transformInputToCommand(userInput, dT);
        
        if (userInput.leftKey) {
            let deltaAngle = 0;
            switch (userInput.leftKeyPress) {
                case "short":
                    deltaAngle = 0.005;
                    break;
                case "medium":
                    deltaAngle = 0.010;
                    break;
                case "long":
                    deltaAngle = 0.050;
                    break;
            }
            this.movePin(deltaAngle);
        }

        if (userInput.rightKey) {
            let deltaAngle = 0;
            switch (userInput.rightKeyPress) {
                case "short":
                    deltaAngle = -0.005;
                    break;
                case "medium":
                    deltaAngle = -0.010;
                    break;
                case "long":
                    deltaAngle = -0.050;
                    break;
            }
            this.movePin(deltaAngle);
        }

        if (userInput.upKey) {
            const insertionResult = this.tryInsertPin();

            if (insertionResult == "success") {
                this._lastInsertionResult = insertionResult;
                this._soundFactory.playInsert();
            }
            else if (insertionResult == "fail") {
                this._lastInsertionResult = insertionResult;
                this._soundFactory.playError();
            }
            else {
                console.log("Already Inserted");
            }
        }
        else if (this._lastInsertionResult == "success") {
            this._stateManager.activateNextPin();
            this._lastInsertionResult = "";
        }
    }

    movePin(deltaAngle) {
        this._stateManager.PinDeltaAngle = deltaAngle;
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
    
    rotateOnce() {
        this._ctx.tm.createLinearTransiton(
            (v) => { this._ctx.s.tumblerAngle = v; this._ctx.s.needsRedraw = true;},
            this._ctx.s.tumblerAngle,
            this._ctx.s.tumblerAngle + 2 * Math.PI,
            2000,
            () => { console.log("rotateOnce complete"); });
    }
    shakeKeyPlug() {
        return;
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

        const activePin = this._stateManager.ActivePin;

        if (activePin) {
            if (activePin.i) {
                return "already";
            }
            else {
                const canInsert = isKeyPinInCut(
                    activePin.a,
                    this._stateManager.TumblerAngle + activePin.ca,
                    this._currentConfig.matchTolerance);
                
                activePin.a = canInsert ? this._stateManager.TumblerAngle : activePin.a; // align if inserted
                
                if (canInsert) {
                    this._stateManager.insertPin(this._stateManager.ActivePin);
                    //this.shakeKeyPlug();

                    return "success";
                }
                else {
                    return "fail";
                }
            }
        }
    }
}