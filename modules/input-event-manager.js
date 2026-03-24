/** @typedef {import("./types.js").UserInputState} UserInputState */

export default class InputEventManager {
    /**
     * Hookup HTML event listeners to modify KeyboardState
     * 
     * @param {HTMLDocument} htmlDoc 
     */
    constructor(htmlDoc) {
        htmlDoc.addEventListener("keydown", this._keyDown);
        htmlDoc.addEventListener("keyup", this._keyUp);
        htmlDoc.addEventListener("mousemove", this._mouseMove);
        htmlDoc.addEventListener("mousedown", this._mouseDown);
        htmlDoc.addEventListener("mouseup", this._mouseUp);
        htmlDoc.addEventListener("click", this._mouseClick);
    }

    _leftKeyHoldTime = 0;
    _rightKeyHoldTime = 0;
    _upKeyHoldTime = 0;
    _downKeyHoldTime = 0;

    _leftKey = false;
    _rightKey = false;
    _upKey = false;
    _downKey = false;
    _leftButton = false;
    _rightButton = false;
    _leftClick = false;
    _rightClick = false;
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
        leftButton: false,
        rightButton: false,
        leftClick: false,
        rightClick: false,
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
        this._userInputState.leftKeyPress = this._keyPressFromHoldTime(this._leftKeyHoldTime);
        
        this._userInputState.rightKey = this._rightKey;
        this._userInputState.rightKeyPress = this._keyPressFromHoldTime(this._rightKeyHoldTime);

        this._userInputState.upKey = this._upKey;
        this._userInputState.upKeyPress = this._keyPressFromHoldTime(this._upKeyHoldTime);

        this._userInputState.downKey = this._downKey;
        this._userInputState.downKeyPress = this._keyPressFromHoldTime(this._downKeyHoldTime);
        
        this._userInputState.leftButton = this._leftButton;
        this._userInputState.rightButton = this._rightButton;
        this._userInputState.leftClick = this._leftClick;
        this._userInputState.rightClick = this._rightClick;
        this._userInputState.pointerX = this._pointerX;
        this._userInputState.pointerY = this._pointerY;

        return this._userInputState;
     }

     _keyPressFromHoldTime(holdTime) {
        if (holdTime == 0) {
            return "none";
        }
        else if (holdTime > 0 && holdTime < 250) {
            return "short";
        }
        else if (holdTime >= 250 && holdTime < 500) {
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
        this._pointerX = e.clientX;
        this._pointerY = e.clientY;
    }
    
    _mouseDown = (e) => {
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
        this.leftButton = true;
        /*
        const buttonInfo = this._buttonFromHtmlEvent(e);

        if (buttonInfo) {
            buttonInfo.s = "pressed";
        }*/
    }

    _mouseUp = (e) => {
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
        this.leftButton = false;
        /*
        const buttonInfo = eventHandlers._buttonFromHtmlEvent(e);

        if (buttonInfo) {
            buttonInfo.s = "normal";
            ctx.s.needsRedraw = true; // FIXME
        }*/
    }
            
    _mouseClick(e) {
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
        this.leftClick = true; // FIXME
        /*
        const buttonInfo = eventHandlers._buttonFromHtmlEvent(e);

        if (buttonInfo) {
            ctx.a.fromCommand(buttonInfo.text);
        }*/
    }

    _buttonFromHtmlEvent(e) {
        /*
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
        return foundButton;*/
    }
}