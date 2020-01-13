'use strict';

const Homey = require('homey');

class ZWA008Driver extends Homey.Driver {
    onInit() {
        super.onInit();


        this.sceneTrigger = new Homey.FlowCardTriggerDevice('zwa008_scene').register().registerRunListener((args, state) => {
            return args.device.sceneRunListener(args, state);
        });

    }
}

module.exports = ZWA008Driver;
