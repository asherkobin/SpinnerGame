/**
 * @typedef {Object} UIColor
 * @property {string} LightBrown
 * @property {string} MediumBrown
 * @property {string} DarkBrown
 * @property {MetalColor} Metal
 */

/**
 * @typedef {Object} MetalColor
 * @property {string} TumblerStop1
 * @property {string} TumblerStop2
 * @property {string} TumblerStop3
 * @property {string} TumblerStop4
 * @property {string} PinStop1
 * @property {string} PinStop2
 * @property {string} PinStop3
 */

/**
 * @typedef {Object} Config
 * @property {number} matchTolerance
 * @property {number} tumblerVelocity
 * @property {number} tumblerAcceleration
 * @property {number} tumblerFriction
 * @property {number} numSpots
 * @property {number} numScratches
 * @property {Object} keyPins
 */

/**
 * @typedef {Object} PinInfo
 * @property {number} AngularWidth
 * @property {number} RadialWidth
 * @property {number} RadialDistance
 * @property {number} AngularPosition
 * @property {number} CutPosition
 * @property {boolean} PositionLocked
 */

/**
 * @typedef {Object} State
 * @property {number} tumblerAngle
 * @property {number} lastTime
 * @property {number} pinDeltaAngle
 * @property {number} lastLeftKeyDown
 * @property {number} lastRightKeyDown
 * @property {boolean} allPinsInserted
 * @property {number} plugAngle
 * @property {boolean} needsRedraw
 * @property {number} activePinIdx
 * @property {PinInfo[]} Pins
 * @property {boolean} Win
 */

/**
 * @typedef {Object} UserInputState
 * @property {boolean} leftKey
 * @property {boolean} rightKey
 * @property {boolean} upKey
 * @property {boolean} downKey
 * @property {string} leftKeyPress
 * @property {string} rightKeyPress
 * @property {string} upKeyPress
 * @property {string} downKeyPress
 * @property {boolean} pointerButton
 * @property {string} pointerClick
 * @property {number} pointerX
 * @property {number} pointerY
 */

/**
 * @typedef {Object} Layout
 * @property {CanvasRenderingContext2D} c - Canvas API Context
 * @property {HTMLDocument} htmlDoc
 * @property {DOMRect} htmlClientRect
 * @property {number} w
 * @property {number} h
 * @property {number} x
 * @property {number} y
 * @property {number} bh
 * @property {number} bw
 * @property {number} bpx
 * @property {number} bpy
 * @property {number} bh
 * @property {number} bw
 * @property {number} bpx
 * @property {number} bpy
 * @property {number} bpw
 * @property {number} bph
 * @property {number} tpx
 * @property {number} tpy
 * @property {number} tpw
 * @property {number} tph
 * @property {number} keywayRadius
 * @property {number} plugRadius
 * @property {number} cylinderRadius
 * @property {number} tumblerRadius
 * @property {number} tumblerSpacing
 * @property {Object} buttonInfo
 * @property {Object} spotInfo
 * @property {Object} scratchInfo
 * @property {Object} plugScratchInfo
 * @property {UIColor} colorInfo
 */

export {};