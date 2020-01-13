'use strict';

const Homey = require('homey');

class AeotecPanicButtonDeviceDriver extends Homey.Driver {
    onInit() {
        super.onInit();

        this.pressTrigger = new Homey.FlowCardTriggerDevice('dsa38_press_1').register();
        this.holdTrigger = new Homey.FlowCardTriggerDevice('dsa38_hold_1').register();
    }
}

module.exports = AeotecPanicButtonDeviceDriver;
