'use strict';

const Homey = require('homey');

class AeotecSirenDeviceDriver extends Homey.Driver {
    onInit() {
        super.onInit();

        this.alarmOnFlow = new Homey.FlowCardAction('ZW080-turn_alarm_on')
            .register()
            .registerRunListener( async (args, state) => {
                return await args.device.onOffRunListener(args, state, true);
            });
        this.alarmOffFlow = new Homey.FlowCardAction('ZW080-turn_alarm_off')
            .register()
            .registerRunListener( async (args, state) => {
                return await args.device.onOffRunListener(args, state, false);
            });

        this.changeSoundFlow = new Homey.FlowCardAction('ZW080-set_alarm')
            .register()
            .registerRunListener( async (args, state) => {
                return await args.device.changeSoundRunListener(args, state);
            });
    }
}

module.exports = AeotecSirenDeviceDriver;
