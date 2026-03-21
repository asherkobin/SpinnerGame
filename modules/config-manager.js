/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").Layout} Layout */
/** @typedef {import("./types.js").Colors} Colors */

//
// generate levels, difficulties, etc
//

/** @type {Config} */
const Config = {
    matchTolerance: (Math.PI / 180) * 5,
    tumblerVelocity: 0.006283 / 2,
    tumblerAcceleration: 0.000002,
    tumblerFriction: 0.94,
    numSpots: 10,
    numScratches: 50,
    keyPins: [
        { startDeg: 0,   widthDeg: 30, depthPx: 30 },
        { startDeg: 45,  widthDeg: 20, depthPx: 40 },
        { startDeg: 200, widthDeg: 50, depthPx: 20 }]
}

class ConfigManager
{
    /** @returns {Config} */
    getEasy() {
        return this._easyConfig;
    }

    getColors() {
        return this._defaultColors;
    }

    /** @type {Config} */
    _easyConfig = Config;

    /** @type {Colors} */
    _defaultColors = {
        LightBrown: "#5a3b23",
        MediumBrown: "#4a2f1d",
        DarkBrown: "#3a2416",
        RandomColor: "#123456"
    }
}

class LayoutFactory {
    _initCanvas(htmlDoc) {
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
    Create(htmlDoc, gameWidth, gameHeight) {
        const canvasElem = this._initCanvas(htmlDoc);
        const htmlClientRect = canvasElem.getBoundingClientRect();

        /** @type {Layout} */
        const Layout = {
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

        return Layout;
    }
}

export { ConfigManager, LayoutFactory }
