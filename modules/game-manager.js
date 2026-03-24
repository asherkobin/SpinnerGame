import InputEventManager from "./input-event-manager";
import StateManager from "./state-manager";
import  { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler, drawScratches, drawSpots, drawCylinder, drawPins, drawButtonPanel }  from "./canvas";
import SoundFactory from "./sound-factory";
import GameActions from "./game-actions";
import ConfigManager from "./config-manager";

/** @typedef {import("./types.js").Context} Context */
/** @typedef {import("./types.js").UserInputState} UserInputState */
/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Layout} Layout */

//
// Contains the main loop that is called in conjuction with 
// html's window.requestAnimationFrame.
//

export default class GameManager {
    /** @param {HTMLDocument} htmlDoc */
    /** @param {StateManager} stateManager */
    /** @param {ConfigManager} configManager */
    /** @param {SoundFactory} soundFactory */
    constructor(htmlDoc, stateManager, configManager, soundFactory) {
        this._inputEventManager = new InputEventManager(htmlDoc);
        /** @type {StateManager} */
        this._stateManager = stateManager;
        this._stateManager.State = stateManager.createStateFromConfig(configManager.Easy);
        this._currentLayout = configManager.DefaultLayout;
        this._soundFactor = soundFactory;
        this._gameActions = new GameActions(stateManager);
    }
    
    startLoop() {
        this._savedTimeStamp = 0;
        this._loopCallback = this.mainLoop.bind(this);

        window.requestAnimationFrame(this._loopCallback);
    }
    
    /**
     * ---> MAIN LOOP <---
     * 
     * @param {number} timeStamp 
     */
    mainLoop(timeStamp) {
        const timeNow = timeStamp;
        const timeLast = (this._savedTimeStamp == 0) ? timeStamp : this._savedTimeStamp;
        const timeDelta = timeNow - timeLast;

        this.getInput(timeDelta);
        this.updateState(timeDelta);
        this.renderUI(timeDelta);
        this.renderViewport(timeDelta);

        this._savedTimeStamp = timeStamp;
        
        window.requestAnimationFrame(this._loopCallback);
    }

    getInput(dT) {
        /** @type {UserInputState} */
        this._inputState = this._inputEventManager.getState(dT);
    }

    renderUI(dT) {
        // TBD
    }

    renderViewport(dT) {
        const updateRegions =  this._stateManager.getUpdateRegions();
        const g = {

            l: this._currentLayout,
            s: this._stateManager.State
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

    /**
     * @param {number} dT 
     */
    updateState(dT) {
        if (this._inputState.leftKey) {
            let deltaAngle = 0;
            switch (this._inputState.leftKeyPress) {
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
            this._gameActions.movePin(deltaAngle);
        }

        if (this._inputState.rightKey) {
            let deltaAngle = 0;
            switch (this._inputState.rightKeyPress) {
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
            this._gameActions.movePin(deltaAngle);
        }
    }
}