'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW111C extends ZwaveDevice {
	
	onMeshInit() {
        this.registerCapability('onoff', 'BASIC');
        this.registerCapability('dim', 'BASIC');

        this.registerCapability('measure_power', 'METER');
        this.registerCapability('meter_power', 'METER');
    }

}

module.exports = ZW111C;