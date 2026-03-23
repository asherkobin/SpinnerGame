import { StateManager } from "./state-manager";
import RenderManager from "./render-manager";
import TransitionManager from "./transition-manager"
import { ConfigManager } from "./config-manager";
import SoundFactory from "./sound-factory";
import GameActions from "./game-actions";

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
 * @property {Object} allPinsInserted
 * @property {number} plugAngle
 * @property {Object} needsRedraw
 * @property {Object} pinIterator
 * @property {Object} activePin
 */

/**
 * @typedef {Object} KeyboardState
 * @property {Object} leftKeyDown
 * @property {Object} rightKeyDown
 * @property {Object} upKeyDown
 * @property {Object} downKeyDown
 * @property {Object} lastLeftKeyPress
 * @property {Object} lastRightKeyPress
 * @property {Object} lastUpKeyPress
 * @property {Object} lastDownKeyPress
 */

/**
 * @typedef {Object} Context
 * @property {StateManager} sm
 * @property {RenderManager} rm
 * @property {TransitionManager} tm
 * @property {ConfigManager} cm
 * @property {State} s
 * @property {Layout} l
 * @property {SoundFactory} f
 * @property {Config} g
 * @property {KeyboardState} k
 * @property {GameActions} a
 */

/**
 * @typedef {Object} Layout
 * @property {CanvasRenderingContext2D} c - Canvas API Context
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
 */

export {};