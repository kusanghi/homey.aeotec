'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecSmartDimmerSixDevice extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL');
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');

		this.registerCapability('measure_power', 'METER');
        this.registerCapability('meter_power', 'METER');

        this.registerSetting('80', input => new Buffer([(input) ? 2: 0]));
    }
	
}

module.exports = AeotecSmartDimmerSixDevice;