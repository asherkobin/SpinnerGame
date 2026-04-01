import InputEventManager from "./input-event-manager.js";
import StateManager from "./state-manager.js";
import { drawBackground, drawTitlePanel, drawStatusBox, drawTumbler }  from "./canvas.js";
import { drawGameInfoBox, drawCylinder, drawPins, drawButtonPanel }  from "./canvas.js";
import SoundFactory from "./sound-factory.js";
import LogicHelper from "./logic-helper.js";
import ConfigManager from "./config-manager.js";

/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").UserInputState} UserInputState */
/** @typedef {import("./types.js").State} State */
/** @typedef {import("./types.js").Layout} Layout */

//
// Contains the main loop that is called in conjuction with 
// html's window.requestAnimationFrame.
//

export default class GameManager {
    /**
     * Game Manager
     * 
     * @param {HTMLDocument} htmlDoc
     * @param {ConfigManager} configManager
     * @param {StateManager} stateManager
     * @param {SoundFactory} soundFactory
     */
    constructor(htmlDoc, configManager, stateManager, soundFactory) {
        /** @type {InputEventManager} */
        this._inputEventManager = new InputEventManager(
            htmlDoc,
            configManager.Layout.htmlClientRect.x,
            configManager.Layout.htmlClientRect.y
        );
        /** @type {StateManager} */
        this._stateManager = stateManager;
        /** @type {SoundFactory} */
        this._soundFactory = soundFactory;
        /** @type {Config} */
        this._currentConfig = configManager.Easy;
        /** @type {Layout} */
        this._currentLayout = configManager.Layout;
        /** @type {LogicHelper} */
        this._logicHelper = new LogicHelper(
            this._stateManager,
            this._currentConfig,
            this._currentLayout,
            this._soundFactory);

        this._lastInsertionResult = "unknown";

        // TEMP FIX
        htmlDoc.addEventListener("pointerdown", soundFactory.primeAudio.bind(soundFactory), { once: true });
        htmlDoc.addEventListener("keydown", soundFactory.primeAudio.bind(soundFactory), { once: true });
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
            s: this._stateManager._currentState
        }
        
        if (updateRegions.length > 0) {
            drawBackground(g);
            drawTitlePanel(g);
            drawGameInfoBox(g);
            drawTumbler(g);
            drawCylinder(g);
            drawPins(g)
            drawStatusBox(g);
            drawButtonPanel(g);

            this._stateManager.clearUpdateRegions();
        }
    }

    /**
     * @param {number} dT 
     */
    updateState(dT) {
        this._logicHelper.updateGameState(this._inputState, dT);
    }
}