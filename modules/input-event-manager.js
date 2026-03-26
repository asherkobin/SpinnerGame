/** @typedef {import("./types.js").UserInputState} UserInputState */

export default class InputEventManager {
    /**
     * Hookup HTML event listeners to modify KeyboardState
     * 
     * @param {HTMLDocument} htmlDoc 
     * @param {number} offsetX 
     * @param {number} offsetY 
     */
    constructor(htmlDoc, offsetX, offsetY) {
        htmlDoc.addEventListener("keydown", this._keyDown);
        htmlDoc.addEventListener("keyup", this._keyUp);
        htmlDoc.addEventListener("mousemove", this._mouseMove);
        htmlDoc.addEventListener("mousedown", this._mouseDown);
        htmlDoc.addEventListener("mouseup", this._mouseUp);

        this._offsetX = offsetX;
        this._offxetY = offsetY;
    }

    _leftKeyHoldTime = 0;
    _rightKeyHoldTime = 0;
    _upKeyHoldTime = 0;
    _downKeyHoldTime = 0;
    _pointerHoldTime = 0;

    _leftKey = false;
    _rightKey = false;
    _upKey = false;
    _downKey = false;
    _pointerButton = false;
    _pointerX = 0;
    _pointerY = 0;

     /** @type {UserInputState} */
    _userInputState = {
        leftKey: false,
        rightKey: false,
        upKey: false,
        downKey: false,
        leftKeyPress: "none",
        rightKeyPress: "none",
        upKeyPress: "none",
        downKeyPress: "none",
        pointerButton: false,
        pointerClick: "none",
        pointerX: 0,
        pointerY: 0
    };

    /**
     * Returns the current input state (keyboard/mouse)
     * 
     * @param {number} dT
     * @returns {UserInputState}
     */
    getState(dT) {
        this._leftKeyHoldTime = (this._leftKey) ? this._leftKeyHoldTime + dT : 0;
        this._rightKeyHoldTime = (this._rightKey) ? this._rightKeyHoldTime + dT : 0;
        this._upKeyHoldTime = (this._upKey) ? this._upKeyHoldTime + dT : 0;
        this._downKeyHoldTime = (this._downKey) ? this._downKeyHoldTime + dT : 0;

        this._userInputState.leftKey = this._leftKey;
        this._userInputState.leftKeyPress = this._inputStateFromHoldTime(this._leftKeyHoldTime);
        
        this._userInputState.rightKey = this._rightKey;
        this._userInputState.rightKeyPress = this._inputStateFromHoldTime(this._rightKeyHoldTime);

        this._userInputState.upKey = this._upKey;
        this._userInputState.upKeyPress = this._inputStateFromHoldTime(this._upKeyHoldTime);

        this._userInputState.downKey = this._downKey;
        this._userInputState.downKeyPress = this._inputStateFromHoldTime(this._downKeyHoldTime);
    
        const wasDown = this._userInputState.pointerButton;
        const isDown = this._pointerButton;

        this._userInputState.pointerClick = !isDown && wasDown ? this._inputStateFromHoldTime(this._pointerHoldTime) : "none";
        this._pointerHoldTime = isDown ? this._pointerHoldTime + dT : 0;
        this._userInputState.pointerButton = isDown;

        this._userInputState.pointerX = this._pointerX;
        this._userInputState.pointerY = this._pointerY;

        return this._userInputState;
     }

    _updateButtonState(isDown, wasDown, holdTime, dT) {
        let inputState = "none";

        if (isDown) {
            holdTime += dT;
        }
        else if (wasDown) {
            inputState = this._inputStateFromHoldTime(holdTime);
            holdTime = 0;
        }

        return { holdTime, inputState };
    }

     _inputStateFromHoldTime(holdTime) {
        if (holdTime == 0) {
            return "none";
        }
        else if (holdTime > 0 && holdTime < 500) {
            return "short";
        }
        else if (holdTime >= 500 && holdTime < 1000) {
            return "medium";
        }
        else {
            return "long";
        }
     }

    _keyDown = (e) => {
        if (e.key == "ArrowRight") {
            this._rightKey = true;
        }
        else if (e.key == "ArrowLeft") {
            this._leftKey = true;
        }
        else if (e.key == "ArrowUp") {
            this._upKey = true;
        }
        else if (e.key == "ArrowDown") {
            this._downKey = true;
        }
    }

    _keyUp = (e) => {
        if (e.key == "ArrowRight") {
            this._rightKey = false;
        }
        else if (e.key == "ArrowLeft") {
            this._leftKey = false;
        }
        else if (e.key == "ArrowUp") {
            this._upKey = false;
        }
        else if (e.key == "ArrowDown") {
            this._downKey = false;
        }
    }
        
    _mouseMove = (e) => {
       // this._pointerX = e.clientX;
       // this._pointerY = e.clientY;
    }
    
    _mouseDown = (e) => {
        this._pointerX = e.clientX - this._offsetX;
        this._pointerY = e.clientY - this._offxetY;
        this._pointerButton = true;
    }

    _mouseUp = (e) => {
      //  this._pointerX = e.clientX;
       // this._pointerY = e.clientY;
        this._pointerButton = false;
    }
}