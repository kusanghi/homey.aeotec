'use strict';

const Homey = require('homey');

class ZW130Driver extends Homey.Driver {
    onInit() {
        super.onInit();

        this.batteryTrigger = new Homey.FlowCardTriggerDevice('zw130_battery_full').register();
        this.sceneTrigger = new Homey.FlowCardTriggerDevice('zw130_scene').register().registerRunListener((args, state) => {
            return args.device.sceneRunListener(args, state);
        });
        this.dimTrigger = new Homey.FlowCardTriggerDevice('zw130_dim').register().registerRunListener((args, state) => {
            return args.device.dimRunListener(args, state);
        });
    }
}

module.exports = ZW130Driver;
