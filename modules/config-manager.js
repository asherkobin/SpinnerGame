/** @typedef {import("./types.js").Config} Config */
/** @typedef {import("./types.js").Layout} Layout */
/** @typedef {import("./types.js").UIColor} UIColor */
/** @typedef {import("./types.js").MetalColor} MetalColor */

//
// generate levels, difficulties, etc
//

/** @type {Config} */
const EasyConfig = {
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

/** @type {MetalColor} */
const Bronze = {
    TumblerStop1: "#b0811e",
    TumblerStop2: "#c9982f",
    TumblerStop3: "#c9982f",
    TumblerStop4: "#b0811e"
}

/** @type {MetalColor} */
const Nickel = {
    TumblerStop1: "black",
    TumblerStop2: "black",
    TumblerStop3: "black",
    TumblerStop4: "black"
}

// https://www.directdoorhardware.com/kwikset-deadbolts.htm
// polished brass, antique brass, antique nickel, rustic pewter, rustic bronze
// venetian bronze, satin nickel, polished chrome, satin chrome, iron black

const metalTypes = [ // TBD
    { name: "bronze", colors: Bronze },
    { name: "nickel", colors: Nickel },
]

class ConfigManager
{
     _selectedMetalColor = Bronze

    /** @returns {Config} */
    get Easy() {
        return EasyConfig;
    }

    /** @type {UIColor} */
    get UIColor() {
        return {        
            LightBrown: "#5a3b23",
            MediumBrown: "#4a2f1d",
            DarkBrown: "#3a2416",
            Metal: this._selectedMetalColor
        };
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
