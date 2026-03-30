/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").UserInputState} UserInputState */
/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").Layout} Layout */
/** @typedef {import("./types.js").PinInfo} PinInfo */

import StateManager from "./state-manager.js";
import SoundFactory from "./sound-factory.js";
import TransitionManager from "./transition-manager.js";
import { Vector2 } from "./vectors.js";

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
    inputToCommand(userInput, dT) {
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

    isWinCondition() {
        return this._stateManager.areAllPinsEngaged();
    }

    /**
     * Main entry-point that calls StateManager based on user input and time change.
     * 
     * @param {UserInputState} userInput
     * @param {number} dT
     */
    updateGameState(userInput, dT)
    {
        // Step 1: Execute direct commands from the UI
        this.runCommand(this.inputToCommand(userInput, dT));

        // Step 2: Update animations
        this._transitionManager.handleTimeChange(dT);

        // Step 3:  Adjust the pin location
        this._stateManager.PinDeltaAngle = this.keyPressToDeltaAngle(
            userInput.leftKeyPress, userInput.rightKeyPress);

        // Step 4: Handle insertion attempt
        this._lastInsertionTime += dT;

        if (userInput.upKey) {
            if (this._lastInsertionTime > this._maxWaitTime) {
                const insertionResult = this.tryInsertPin();
                
                this._stateManager.PreviousAttemptWasFail = false;

                if (insertionResult == "succeed") {
                    this._stateManager.engageActivePin();
                    this.animatePinInsertion();
                }
                else if (insertionResult == "fail") {
                    this._soundFactory.playError();
                    this._lastInsertionTime = 0;
                    this._stateManager.PreviousAttemptWasFail = true;
                }
            }
        }
        else if (this._stateManager.ActivePinStatus == "engaged" && this._pinInsertionComplete) {
            this._pinInsertionComplete = false;
            this._stateManager.activateNextPin();

            if (this.isWinCondition()) {
                this._stateManager.Win = true;
                this._soundFactory.playUnlock();
                this.animateVictory();
            }
            else {
                this._soundFactory.playInsert();
                this.animateKeyPlug();
            }
        }
    }

    keyPressToDeltaAngle(leftKeyPress, rightKeyPress) {
        switch (leftKeyPress) {
            case "short":
                return 0.005;
            case "medium":
                return 0.020;
            case "long":
                return 0.050;
        }

        switch (rightKeyPress) {
            case "short":
                return -0.005;
            case "medium":
                return -0.020;
            case "long":
                return -0.050;
        }

        return 0;
    }

    runCommand(uiCommand) {
        switch (uiCommand) {
            case "Connect":
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

        if (this._stateManager.ActivePinStatus == "none") {
            return "no active pin";
        }
        else if (this._stateManager.ActivePinStatus == "engaged") {
            return "already engaged";
        }
        else if (this._stateManager.ActivePinStatus == "open") {
            const canInsert = isKeyPinInCut(
                this._stateManager.ActivePinAngle,
                this._stateManager.TumblerAngle + this._stateManager.ActivePinCutAngle,
                this._currentConfig.matchTolerance);
            
            if (canInsert) {
                return "succeed";
            }
            else {
                return "fail";
            }
        }
        else {
            return "unknown";
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
        this._soundFactory.stopAll();
    }
    
    animatePinInsertion() {
        this._transitionManager.createLinearTransiton(
            v => { this._stateManager.ActivePinDistance = v; },
            this._stateManager.ActivePinDistance,
            this._stateManager.ActivePinCutDepth + 10, // FIXME
            250,
            () => { this._pinInsertionComplete = true; });
    }

    animateVictory() {
        this.animateKeyPlug().then(() => this.rotateOnce(6));
    }

    async animateKeyPlug() {
        const moveAngle = 2 * Math.PI / 64;

        await this.rotateKeyPlug(0, moveAngle, 100);
        await this.rotateKeyPlug(moveAngle, -2 * moveAngle, 200);
        await this.rotateKeyPlug( -2 * moveAngle, 0, 100);
    }
    
    async rotateKeyPlug(rotateFrom, rotateTo, inThisMS) {
        return new Promise(resolve => {
            this._transitionManager.createLinearTransiton(
                v => { this._stateManager.PlugAngle = v; },
                rotateFrom,
                rotateTo,
                inThisMS,
                () => { resolve() })});
    }

    rotateOnce(numSecs) {
        this._transitionManager.createLinearTransiton(
            v => { this._stateManager.TumblerAngle = v },
            this._stateManager.TumblerAngle,
            this._stateManager.TumblerAngle + 2 * Math.PI,
            numSecs * 1000,
            () => { });
    }
}