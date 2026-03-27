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
     * @param {Layout} uiLayout
     * @param {SoundFactory} soundFactory
     */
    constructor (stateManager, currentConfig, uiLayout, soundFactory) {
        /** @type {StateManager} */
        this._stateManager = stateManager;
        /** @type {Config} */
        this._currentConfig = currentConfig;
        /** @type {Layout} */
        this._uiLayout = uiLayout;
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
        const foundButton = this._uiLayout.buttonInfo.find(b => {
            const bx = this._uiLayout.bpx + b.x;
            const by = this._uiLayout.bpy + b.y;
            const bw = b.w;
            const bh = this._uiLayout.bh;
            
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

        let deltaAngle = 0;
        
        if (userInput.leftKey) {
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
        }

        if (userInput.rightKey) {
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
        }

        this._stateManager.PinDeltaAngle = deltaAngle;

        this._lastInsertionTime += dT;

        if (userInput.upKey) {
            if (this._lastInsertionTime > this._maxWaitTime) {
                const insertionResult = this.tryInsertPin();
                const activePin = this._stateManager.ActivePin;

                if (insertionResult == "succeed") {
                    this._soundFactory.playInsert();
                    activePin.AngularPosition = activePin.CutPosition;
                    activePin.PositionLocked = true;
                    this.animatePinInsertion();
                    this._lastInsertionTime = 0;
                }
                else if (insertionResult == "fail") {
                    this._soundFactory.playError();
                    this._lastInsertionTime = 0;
                }
            }
        }
    }

    runCommand(uiCommand) {
        switch (uiCommand) {
            case "Connect":
                //this.animatePin();
                this.rotateOnce();
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
                activePin.AngularPosition,
                this._stateManager.TumblerAngle + activePin.CutPosition,
                this._currentConfig.matchTolerance);
            
            if (canInsert) {
                return "succeed";
            }
            else {
                return "fail";
            }
        }
    }

    resetGame() {
        this._soundFactory.stopAll();
        this._uiLayout.buttonInfo[1].text = "Start"; // FIXME
        this._transitionManager.removeAll();
        this._stateManager.loadFromConfig();
    }

    startTumbler() {
        this._tmid = this._transitionManager.createRotatingTransiton(
            v => this._stateManager.TumblerAngle = v,
            this._stateManager.TumblerAngle,
            this._currentConfig.tumblerVelocity);

        this._uiLayout.buttonInfo[1].text = "Stop"; // FIXME
        this._soundFactory.startRotationLoop();
    }
    
    stopTumbler() {
        this._transitionManager.stopAndRemove(this._tmid);
        this._uiLayout.buttonInfo[1].text = "Start"; // FIXME
        this._soundFactory.stopRotationLoop();
    }

    rotateOnce() {
        this._transitionManager.createLinearTransiton(
            v => { this._stateManager.TumblerAngle = v },
            this._stateManager.TumblerAngle,
            this._stateManager.TumblerAngle + 2 * Math.PI,
            2000,
            () => {  });
    }
    
    animatePinInsertion() {
        this._transitionManager.createLinearTransiton(
            v => { this._stateManager.ActivePin.RadialDistance = v; this._stateManager.invalidateAll() },
            this._stateManager.ActivePin.RadialDistance,
            this._uiLayout.tumblerRadius - (this._stateManager.ActivePin.RadialWidth - 7),
            250,
            () => { 
                this._stateManager.activateNextPin(); });
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