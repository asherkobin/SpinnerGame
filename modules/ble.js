//
// bluetooth low energy
//

function connectToController() {
    const service_uid = "00001623-1212-efde-1623-785feabcd123";
    const characteristic_uid = "00001624-1212-efde-1623-785feabcd123";
    const setup_data = new Uint8Array([10, 0, 0x41, 0, 0x04, 1, 0, 0, 0, 1]);
    
    // 10   => Size
    // 0    => Hub 0
    // 0x41 => Message Type - Port Input Format Setup (Single) [0x41]
    // 1    => BOTH BUTTONS = 1 (LEFT ONLY = 0)
    // 0x04 => REMOTE_BUTTONS_MODE_KEYSD = 4
    // 1    => DELTA_INTERVAL = 1 (4 BYTES)
    // 1    => ENABLE_NOTIFICATIONS
    
    navigator.bluetooth.requestDevice({
        filters: [{ name: "Handset"}],
        optionalServices: [service_uid] })
        .then(device => device.gatt.connect())
        .then(server => server.getPrimaryService(service_uid))
        .then(service => service.getCharacteristic(characteristic_uid))
        .then(characteristic => {
            characteristic.writeValueWithResponse(setup_data)
                .then(response => {
                    characteristic.startNotifications();
                })
                .then(() => {
                    characteristic.addEventListener("characteristicvaluechanged", eventHandlers.controllerEvent);
                    console.log("Subscribed via BLE");
                })
        })
        .catch(e => { console.log(`(BLE) ${e}`); });
}

function controllerEvent(e) {
    const data = e.target.value.buffer ? e.target.value : new DataView(e.target.value);
    const button_state = {
        left_plus: false,
        left_stop: false,
        left_minus: false,
        center: false,
        right_plus: false,
        right_stop: false,
        right_minus: false
    };

    if (data.getUint8(0) == 5) {
        if (data.getUint8(2) == 0x08) { // LWP3_MSG_TYPE_HW_NET_CMDS
            button_state.center = data.getUint8(4) == 1;
        }
    }
    else if (data.getUint8(0) == 7) {
        if (data.getUint8(2) == 0x45) { // LWP3_MSG_TYPE_PORT_VALUE
            if (data.getUint8(3) == 0) { // LEFT
                button_state.left_plus = data.getUint8(4) == 1;
                button_state.left_stop = data.getUint8(5) == 1;
                button_state.left_minus = data.getUint8(6) == 1;
            }
            else if (data.getUint8(3) == 1) { // RIGHT
                button_state.right_plus = data.getUint8(4) == 1;
                button_state.right_stop = data.getUint8(5) == 1;
                button_state.right_minus = data.getUint8(6) == 1;
            }
        }
    }
    else {
        console.log("Unhandled Event: " + data)
    }
    
    if (button_state.center) {
        gameActionFromCommand("START");
    }

    gameState.leftKeyDown = button_state.left_plus;
    gameState.rightKeyDown = button_state.left_minus;
    gameState.upKeyDown = button_state.left_stop;
}

export { connectToController };