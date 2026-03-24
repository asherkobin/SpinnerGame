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
 * @typedef {Object} State
 * @property {number} tumblerAngle
 * @property {number} lastTime
 * @property {number} pinDeltaAngle
 * @property {Object} pinStates
 * @property {number} lastLeftKeyDown
 * @property {number} lastRightKeyDown
 * @property {boolean} allPinsInserted
 * @property {number} plugAngle
 * @property {boolean} needsRedraw
 * @property {Object} activePin
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
 * @property {boolean} leftButton
 * @property {boolean} rightButton
 * @property {boolean} leftClick
 * @property {boolean} rightClick
 * @property {number} pointerX
 * @property {number} pointerY
 */

/**
 * @typedef {Object} Layout
 * @property {CanvasRenderingContext2D} c - Canvas API Context
 * @property {HTMLDocument} htmlDoc
 * @property {Object} htmlClientRect
 * @property {Object} w
 * @property {Object} h
 * @property {Object} x
 * @property {Object} y
 * @property {Object} bh
 * @property {Object} bw
 * @property {Object} bpx
 * @property {Object} bpy
 * @property {Object} bh
 * @property {Object} bw
 * @property {Object} bpx
 * @property {Object} bpy
 * @property {Object} bpw
 * @property {Object} bph
 * @property {Object} tpx
 * @property {Object} tpy
 * @property {Object} tpw
 * @property {Object} tph
 * @property {Object} keywayRadius
 * @property {Object} plugRadius
 * @property {Object} cylinderRadius
 * @property {Object} tumblerRadius
 * @property {Object} tumblerSpacing
 * @property {Object} buttonInfo
 * @property {Object} spotInfo
 * @property {Object} scratchInfo
 * @property {Object} plugScratchInfo
 * @property {UIColor} colorInfo
 */

export {};