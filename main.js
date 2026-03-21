"use strict";

import { animationHandler } from "./modules/animation.js";
import { soundFactory } from "./modules/sound-facotry.js";
import { connectToController } from "./modules/ble.js";
import { stateManager } from "./modules/state-manager.js";

document.addEventListener("DOMContentLoaded", () => { startGame(document) });

async function startGame(htmlDoc) {
    const ctx = contextManager.initNew(htmlDoc, stateManager);
    
    await soundFactory.initBuffers(); // await is not ideal here
    createParticles(ctx);
    initEventHandlers(ctx, htmlDoc);

    animationHandler.startAnimationLoop(ctx);
}

const contextManager = {
    initNew: (htmlDoc, stateManager) => {
        const gameWidth = 350;
        const gameHeight = 640;
        const layoutInfo = initLayout(htmlDoc, gameWidth, gameHeight);
        const gameConfig = initGameConfig();
        const gameActions = initGameActions();
        const keyboardState = initKeyboardState();
        const gameState = stateManager.createNewState(gameConfig);

        const ctx = {
            sm: stateManager,
            s: gameState,
            l: layoutInfo, 
            f: soundFactory,
            g: gameConfig,
            k: keyboardState,
            a: gameActions,
            requestRedraw: () => { gameState.__needsRedraw = true; }
         };

        return ctx;
    },

    createNewState: () => {
        return stateManager.createNewState(gameConfig)
    },

    // NYI
    requestState: () => { return this.__ctx.s; },
    requestConfig: () => { return this.__ctx.g; },
    requestLayout: () => { return this.__ctx.l; }
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

function initCanvas(htmlDoc) {
    const canvasElem = htmlDoc.createElement("canvas");
    
    canvasElem.style.display = "block";
    canvasElem.style.border = "1px solid black";
    canvasElem.style.margin = "auto";
    canvasElem.width = 350;
    canvasElem.height = 640;
    canvasElem.id = "canvas";

    htmlDoc.body.appendChild(canvasElem);

    return canvasElem;
}

function initLayout(htmlDoc, gameWidth, gameHeight) {
    const canvasElem = initCanvas(htmlDoc);
    const htmlClientRect = canvasElem.getBoundingClientRect();

    return {
        c: canvasElem.getContext("2d"),
        htmlClientRect: htmlClientRect, // FIXME
        w: gameWidth,
        h: gameHeight,
        x: gameWidth / 2,
        y: gameHeight / 2,
        bh: 75,
        bw: 150,
        bpx: 0,
        bpy: gameHeight - 85,
        bpw: gameWidth - 20,
        bph: 85,
        tpx: 10,
        tpy: 10,
        tpw: gameWidth - 20,
        tph: 85,
        keywayRadius: 70,
        plugRadius: 50,
        cylinderRadius: 75,
        tumblerRadius: 130,
        tumblerSpacing: 10, // space between tumbler and key pin
        buttonInfo: [
            { text: "Connect", s: "normal" },
            { text: "Start", s: "normal" },
            { text: "...",  s: "normal" } ],
        spotInfo: [],
        scratchInfo: [],
        plugScratchInfo: []
    };
}

function initKeyboardState() {
    return {
        leftKeyDown: false,
        rightKeyDown: false,
        upKeyDown: false,
        downKeyDown: false,
        lastLeftKeyPress: 0,
        lastRightKeyPress: 0,
        lastUpKeyPress: 0,
        lastDownKeyPress: 0
    };
}

function initGameActions(ctx) {
    return {
        nudgePlug: false,
        nudgePinL: false,
        nudgePinR: false,
        movePinL: false,
        movePinR: false,
        tryInsertPin: false,
        startTumbler: false,
        stopTumbler: false,
        resetGame: false,
        rotateOnce: false,
        gameActionFromCommand: function(cmd) {
            switch (cmd) {
                case "Connect":
                    connectToController();
                    break;
                case "Start":
                    this.startTumbler = true;
                    break;
                case "Stop":
                    this.stopTumbler = true;
                    break;
                case "...":
                    this.resetGame = true;
                    break;
                default:
                    console.log("UNKNOWN ACTIION: " + cmd);
            }
        }
    };
}

function initGameConfig() {
    return {
        matchTolerance: (Math.PI / 180) * 5, // 5 degrees
        tumblerVelocity: 0.006283 / 2,
        tumblerAcceleration: 0.000002,
        tumblerFriction: 0.94,
        numSpots: 10,
        numScratches: 50,
        keyPins: [
            { startDeg: 0,   widthDeg: 30, depthPx: 30 },
            { startDeg: 45,  widthDeg: 20, depthPx: 40 },
            { startDeg: 200, widthDeg: 50, depthPx: 20 }
        ]
    };
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
                ctx.a.gameActionFromCommand(buttonInfo.text);
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