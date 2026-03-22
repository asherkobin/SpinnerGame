"use strict";

import RenderManager from "./modules/render-manager.js";
import SoundFactory from "./modules/sound-factory.js";
import { StateManager } from "./modules/state-manager.js";
import GameActions from "./modules/game-actions.js";
import TransitionManager from "./modules/transition-manager.js";
import { ConfigManager, LayoutFactory } from "./modules/config-manager.js";

document.addEventListener("DOMContentLoaded", () => { startGame(document) });

async function startGame(htmlDoc) {
    const stateManager = new StateManager();
    const renderManager = new RenderManager();
    const gameActions = new GameActions();
    const soundFactory = new SoundFactory();
    const configManager = new ConfigManager();
    const transitionManager = new TransitionManager();
    const layoutFactory = new LayoutFactory();
    
    const contextManager = new ContextManager(
        htmlDoc,
        configManager,
        stateManager,
        renderManager,
        transitionManager,
        gameActions,
        layoutFactory,
        soundFactory);
    
    await contextManager.getCtx().f.initBuffers(); // await is not ideal here
    createParticles(contextManager.getCtx());
    initEventHandlers(contextManager.getCtx(), htmlDoc);

    renderManager.startLoop(contextManager.getCtx());
}

class ContextManager {
    constructor(
        htmlDoc,
        configManager,
        stateManager,
        renderManager,
        transitionManager,
        gameActions,
        layoutFactory,
        soundFactory) {

        const gameWidth = 350;
        const gameHeight = 640;
        const layoutInfo = layoutFactory.Create(htmlDoc, gameWidth, gameHeight);
        const keyboardState = stateManager.createKeyboardState();
        const gameConfig = configManager.Easy;
        const gameState = stateManager.createStateFromConfig(gameConfig);

        this._ctx = {
            sm: stateManager,
            rm: renderManager, 
            tm: transitionManager,
            cm: configManager,
            s: gameState,
            l: layoutInfo, 
            f: soundFactory,
            g: gameConfig,
            k: keyboardState,
            a: gameActions
         };

         this._ctx.a.setContext(this._ctx); // FIXME
    }

    getCtx() {
        return this._ctx;
    }
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

function initEventHandlers(ctx, htmlDoc) {
    const eventHandlers = {
        keyDown: (e) => {
            if (e.key == "ArrowRight") {
                ctx.k.rightKeyDown = true;
            }
            else if (e.key == "ArrowLeft") {
                ctx.k.leftKeyDown = true;
            }
            else if (e.key == "ArrowUp") {
                ctx.k.upKeyDown = true;
            }
            else if (e.key == "ArrowDown") {
                ctx.k.downKeyDown = true;
            }
        },
        keyUp: (e) => {
            if (e.key == "ArrowRight") {
                ctx.k.rightKeyDown = false;
            }
            else if (e.key == "ArrowLeft") {
                ctx.k.leftKeyDown = false;
            }
            else if (e.key == "ArrowUp") {
                ctx.k.upKeyDown = false;
            }
            else if (e.key == "ArrowDown") {
                ctx.k.downKeyDown = false;
            }
        },
        mouseMove: (e) => {
        },
        mouseDown: (e) => {
            const buttonInfo = eventHandlers._buttonFromHtmlEvent(e);

            if (buttonInfo) {
                buttonInfo.s = "pressed";
                ctx.s.needsRedraw = true; // FIXME
            }
        },
        mouseUp: (e) => {
            const buttonInfo = eventHandlers._buttonFromHtmlEvent(e);

            if (buttonInfo) {
                buttonInfo.s = "normal";
                ctx.s.needsRedraw = true; // FIXME
            }
            
        },
        mouseClick: (e) => {
            const buttonInfo = eventHandlers._buttonFromHtmlEvent(e);

            if (buttonInfo) {
                ctx.a.fromCommand(buttonInfo.text);
            }
        },
        _buttonFromHtmlEvent: (e) => {
            const x = e.clientX - ctx.l.htmlClientRect.left;
            const y = e.clientY - ctx.l.htmlClientRect.top;
            let foundButton = null;
            ctx.l.buttonInfo.forEach(b => {
                const bx = ctx.l.bpx + b.x;
                const by = ctx.l.bpy + b.y;
                const bw = b.w;
                const bh = ctx.l.bh;
                const pointInButton = x >= bx && x <= bx + bw && y >= by && y <= by + bh;

                if (pointInButton) {
                    foundButton = b;
                    return;
                }
            });
            return foundButton;
        }
    };

    htmlDoc.addEventListener("keydown", eventHandlers.keyDown);
    htmlDoc.addEventListener("keyup", eventHandlers.keyUp);
    htmlDoc.addEventListener("mousemove", eventHandlers.mouseMove);
    htmlDoc.addEventListener("mousedown", eventHandlers.mouseDown);
    htmlDoc.addEventListener("mouseup", eventHandlers.mouseUp);
    htmlDoc.addEventListener("click", eventHandlers.mouseClick);

    return eventHandlers;
}