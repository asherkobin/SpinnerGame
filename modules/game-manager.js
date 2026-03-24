import InputEventManager from "./input-event-manager";
import StateManager from "./state-manager";
import  { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler, drawScratches, drawSpots, drawCylinder, drawPins, drawButtonPanel }  from "./canvas";

/** @typedef {import("./types.js").Context} Context */
/** @typedef {import("./types.js").UserInputState} UserInputState */

//
// Contains the main loop that is called in conjuction with 
// html's window.requestAnimationFrame.
//

export default class GameManager {
    /** @param {HTMLDocument} htmlDoc */
    /** @param {StateManager} stateManager */
    
    constructor(htmlDoc, stateManager, tempState, tempLayout) {
        this._inputEventManager = new InputEventManager(htmlDoc);
        this._stateManager = stateManager;
        this._tempState = tempState;
        this._tempLayout = tempLayout;
    }
    
    startLoop() {
        this._savedTimeStamp = 0;
        this._loopCallback = this.mainLoop.bind(this);

        window.requestAnimationFrame(this._loopCallback);
    }

    gameStages = [
        this.getInput,
        this.updateState,
        this.queueSfx,
        this.renderUI,
        this.renderViewport ];
    
    mainLoop(timeStamp) {
        const timeNow = timeStamp;
        const timeLast = (this._savedTimeStamp == 0) ? timeStamp : this._savedTimeStamp;
        const timeDelta = timeNow - timeLast;

        this.getInput(timeDelta);
        this.updateState(timeDelta);
        this.queueSfx(timeDelta);
        this.renderUI(timeDelta);
        this.renderViewport(timeDelta);

        this._savedTimeStamp = timeStamp;
        
        window.requestAnimationFrame(this._loopCallback);
    }

    getInput(dT) {
        /** @type {UserInputState} */
        this._inputState = this._inputEventManager.getState(dT);
    }

    updateState(dT) {
        if (this._inputState.leftKey) {
            if (this._inputState.leftKeyPress == "short") {
                this._stateManager.updatePinDeltaAngle(0.005);
            }
            else if (this._inputState.leftKeyPress == "medium") {
                this._stateManager.updatePinDeltaAngle(0.010);
            }
            if (this._inputState.leftKeyPress == "long") {
                this._stateManager.updatePinDeltaAngle(0.050);
            }
        }
    }

    queueSfx(dT) {
        // TBD
    }

    renderUI(dT) {
        // TBD
    }

    renderViewport(dT) {
        const updateRegions =  this._stateManager.getUpdateRegions();
        const g = {
            l: this._tempLayout,
            s: this._tempState,
            cm: this._tempCM
        }
        
        if (updateRegions.length > 0) {
            drawBackground(g);
            drawTitlePanel(g);
            drawStatusBox(g);
            drawTumbler(g);
            drawScratches(g);
            drawSpots(g);
            drawCylinder(g);
            drawPins(g)
            drawButtonPanel(g);

            this._stateManager.clearUpdateRegions();
        }
    }
}