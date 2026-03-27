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
    TumblerStop4: "#b0811e",
    PinStop1:     "#c0912e",
    PinStop2:     "#c9982f",
    PinStop3:     "#c0912e"
}
/** @type {MetalColor} */
const Nickel = {
    TumblerStop1: "#b7b2ab",
    TumblerStop2: "#9a958e",
    TumblerStop3: "#2a2a21",
    TumblerStop4: "#7e7973",
    PinStop1:     "#b7b2ab",
    PinStop2:     "#b7b2ab",
    PinStop3:     "#b7b2ab"
}

// https://www.directdoorhardware.com/kwikset-deadbolts.htm
// polished brass, antique brass, antique nickel, rustic pewter, rustic bronze
// venetian bronze, satin nickel, polished chrome, satin chrome, iron black

const metalTypes = [ // TBD
    { name: "bronze", colors: Bronze },
    { name: "nickel", colors: Nickel },
]

export default class ConfigManager
{
    constructor(htmlDoc, gameWidth, gameHeight) {
        /** @type {HTMLCanvasElement} */
        const canvasElem = htmlDoc.createElement("canvas");

        this._selectedMetalColor = Nickel;
        
        canvasElem.style.display = "block";
        canvasElem.style.border = "1px solid black";
        canvasElem.style.margin = "auto";
        canvasElem.width = gameWidth;
        canvasElem.height = gameHeight;
        canvasElem.id = "canvas";

        htmlDoc.body.appendChild(canvasElem);

        /** @type {Layout} */
        this._layoutConfig = {
            c: canvasElem.getContext("2d"),
            htmlDoc: htmlDoc,
            htmlClientRect: canvasElem.getBoundingClientRect(),
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
            plugScratchInfo: [],
            /** @type {UIColor} */
            colorInfo: {        
                LightBrown: "#5a3b23",
                MediumBrown: "#4a2f1d",
                DarkBrown: "#3a2416",
                Metal: this._selectedMetalColor } };

        this.createParticles(this._layoutConfig, this.Easy);
    }

    /** @returns {Config} */
    get Easy() {
        return EasyConfig;
    }

    /** @returns {Layout} */
    get Layout() {
        return this._layoutConfig;
    }

    createParticles(l, c) {
        const createParticle = (innerRadius, outerRadius) => {
            const r = innerRadius + Math.random() * (outerRadius - innerRadius);
            const a = Math.random() * Math.PI * 2;
            const pr = 2 + Math.random() * 2;
            const pa = (Math.PI / 64) + Math.random() * 32 * (Math.PI / 64);
            const f = 0.01 + Math.random() * 0.05;
            const o = {r:r,a:a,pr:pr,pa:pa,f:f};
            return o;
        };
        
        for (let i = 0; i < c.numSpots; i++) {
            l.spotInfo.push(createParticle(l.keywayRadius, l.tumblerRadius));
        }

        for (let i = 0; i < c.numScratches; i++) {
            l.scratchInfo.push(createParticle(l.keywayRadius, l.tumblerRadius));
        }

        for (let i = 0; i < c.numScratches; i++) {
            l.plugScratchInfo.push(createParticle(0, l.plugRadius));
        }
    }
}