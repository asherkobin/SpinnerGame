/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").UserInputState} UserInputState */
/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").Layout} Layout */
/** @typedef {import("./types.js").PinInfo} PinInfo */

import StateManager from "./state-manager.js";
import SoundFactory from "./sound-factory.js";
import TransitionManager from "./transition-manager.js";

export default class LogicHelper {
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
        /** @type {TransitionManager} */
        this._transitionManager = new TransitionManager();

        this._maxWaitTime = 500;
        this._lastInsertionTime = this._maxWaitTime;
    }
    
    /**
     * Generates a command based on user input.
     * 
     * @param {UserInputState} userInput
     * @param {number} dT
     */
    _transformInputToCommand(userInput, dT) {
        if (userInput.pointerClick != "none") {
            const buttonInfo = this._objectFromPoint(userInput.pointerX, userInput.pointerY);
            
            if (buttonInfo) {
                return buttonInfo.text;
            }
        }

        return null;
    }

    /** @returns {object} */
    _objectFromPoint(x, y) {
        // search for button
        const foundButton = this._currentLayout.buttonInfo.find(b => {
            const bx = this._currentLayout.bpx + b.x;
            const by = this._currentLayout.bpy + b.y;
            const bw = b.w;
            const bh = this._currentLayout.bh;
            
            return (x >= bx && x <= bx + bw && y >= by && y <= by + bh);
        });

        return foundButton ?? null;
    }

    _isWinCondition() {
        return this._stateManager.areAllPinsInserted();
    }


    /**
     * Main entry-point that calls StateManager based on user input and time change.
     * 
     * @param {UserInputState} userInput
     * @param {number} dT
     */
    updateGameState(userInput, dT)
    {   
        if (this._isWinCondition()) {
            this._stateManager.Win = true;
        }

        this.runCommand(this._transformInputToCommand(userInput, dT));

        this._transitionManager.handleTimeChange(dT);
        
        if (userInput.leftKey) {
            let deltaAngle = 0;
            switch (userInput.leftKeyPress) {
                case "short":
                    deltaAngle = 0.005;
                    break;
                case "medium":
                    deltaAngle = 0.020;
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
                    deltaAngle = -0.020;
                    break;
                case "long":
                    deltaAngle = -0.050;
                    break;
            }
            this.movePin(deltaAngle);
        }

        this._lastInsertionTime += dT;

        if (userInput.upKey) {
            if (this._lastInsertionTime > this._maxWaitTime) {
                const insertionResult = this.tryInsertPin();

                if (insertionResult == "succeed") {
                    this._soundFactory.playInsert();
                    this._stateManager.activateNextPin();
                    this._lastInsertionTime = 0;
                }
                else if (insertionResult == "fail") {
                    this._soundFactory.playError();
                    this._lastInsertionTime = 0;
                }
            }
        }
    }

    movePin(deltaAngle) {
        this._stateManager.PinDeltaAngle = deltaAngle;
    }
    
    runCommand(uiCommand) {
        switch (uiCommand) {
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

    /**
     * 
     * @returns {string}
     */
    tryInsertPin() {
        function isKeyPinInCut (keyPinAngle, tumblerAngle, matchTolerance) {
            let angleDistance = keyPinAngle - tumblerAngle;
            angleDistance = (angleDistance + Math.PI) % (Math.PI * 2);
            if (angleDistance < 0)
                angleDistance += Math.PI * 2;
            angleDistance = angleDistance - Math.PI;

            return (Math.abs(angleDistance) < matchTolerance);
        }

        /** @type {PinInfo} */
        const activePin = this._stateManager.ActivePin;

        if (activePin.Inserted) {
            return "already inerted";
        }
        else {
            const canInsert = isKeyPinInCut(
                activePin.Angle,
                this._stateManager.TumblerAngle + activePin.CutAngle,
                this._currentConfig.matchTolerance);
            
            activePin.Angle = canInsert ? this._stateManager.TumblerAngle : activePin.Angle; // align if inserted
            
            if (canInsert) {
                this._stateManager.insertPin(this._stateManager.ActivePin);
                //this.shakeKeyPlug();

                return "succeed";
            }
            else {
                return "fail";
            }
        }
    }

    resetGame() {
        this._soundFactory.stopAll();
        this._currentLayout.buttonInfo[1].text = "Start"; // FIXME
        this._transitionManager.removeAll();
        this._stateManager.loadFromConfig();
    }

    startTumbler() {
        this._tmid = this._transitionManager.createRotatingTransiton(
            v => this._stateManager.TumblerAngle = v,
            this._stateManager.TumblerAngle,
            this._currentConfig.tumblerVelocity);

        this._currentLayout.buttonInfo[1].text = "Stop"; // FIXME
        this._soundFactory.startRotationLoop();
    }
    
    stopTumbler() {
        this._transitionManager.stopAndRemove(this._tmid);
        this._currentLayout.buttonInfo[1].text = "Start"; // FIXME
        this._soundFactory.stopRotationLoop();
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
}