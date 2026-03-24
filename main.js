"use strict";

import GameManager from "./modules/game-manager.js"
import ContextManager from "./modules/context-manager.js"
import SoundFactory from "./modules/sound-factory.js";
import StateManager from "./modules/state-manager.js";
import GameActions from "./modules/game-actions.js";
import TransitionManager from "./modules/transition-manager.js";
import { ConfigManager, LayoutFactory } from "./modules/config-manager.js";

document.addEventListener("DOMContentLoaded", () => { startGame(document) });

async function startGame(htmlDoc) {
    const contextManager = new ContextManager();
    const stateManager = new StateManager();
    const gameManager = new GameManager(htmlDoc, stateManager, null);
    const gameActions = new GameActions();
    const soundFactory = new SoundFactory();
    const configManager = new ConfigManager();
    const transitionManager = new TransitionManager();
    const layoutFactory = new LayoutFactory();

    const gameWidth = 350;
    const gameHeight = 640;

    const ctx = contextManager.getCtx();
    
    ctx.sm = stateManager;
    ctx.tm = transitionManager;
    ctx.cm = configManager;
    ctx.gm = gameManager;
    ctx.g = configManager.Easy;
    ctx.s = stateManager.createStateFromConfig(ctx.g);
    ctx.l = layoutFactory.Create(htmlDoc, gameWidth, gameHeight);
    ctx.f = soundFactory;
    ctx.a = gameActions;

    // TEMP SHOEHORN
    gameManager._tempLayout = ctx.l;
    gameManager._tempCM = configManager;
    gameManager._tempState = ctx.s;

    await soundFactory.initBuffers(); // await is not ideal here
    createParticles(ctx);

    gameManager.startLoop();
}

function createParticles(ctx) {
    const createParticle = (innerRadius, outerRadius) => {
        const r = innerRadius + Math.random() * (outerRadius - innerRadius);
        const a = Math.random() * Math.PI * 2;
        const pr = 2 + Math.random() * 2;
        const pa = (Math.PI / 64) + Math.random() * 32 * (Math.PI / 64);
        const f = 0.01 + Math.random() * 0.05;
        const o = {r:r,a:a,pr:pr,pa:pa,f:f};
        return o;
    };
    
    for (let i = 0; i < ctx.g.numSpots; i++) {
        ctx.l.spotInfo.push(createParticle(ctx.l.keywayRadius, ctx.l.tumblerRadius));
    }

    for (let i = 0; i < ctx.g.numScratches; i++) {
        ctx.l.scratchInfo.push(createParticle(ctx.l.keywayRadius, ctx.l.tumblerRadius));
    }

    for (let i = 0; i < ctx.g.numScratches; i++) {
        ctx.l.plugScratchInfo.push(createParticle(0, ctx.l.plugRadius));
    }
}