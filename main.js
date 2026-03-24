"use strict";

import GameManager from "./modules/game-manager.js"
import SoundFactory from "./modules/sound-factory.js";
import StateManager from "./modules/state-manager.js";
import TransitionManager from "./modules/transition-manager.js";
import ConfigManager from "./modules/config-manager.js";

document.addEventListener("DOMContentLoaded", () => { startGame(document) });

async function startGame(htmlDoc) {
    const stateManager = new StateManager();
    const soundFactory = new SoundFactory();
    const configManager = new ConfigManager(htmlDoc, 350, 640);
    const transitionManager = new TransitionManager();
    const gameManager = new GameManager(
        htmlDoc,
        stateManager,
        configManager,
        soundFactory);

    await soundFactory.initBuffers(); // FIXME

    gameManager.startLoop();
}