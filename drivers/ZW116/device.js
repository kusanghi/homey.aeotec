'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW116 extends ZwaveDevice {
	
	onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		
		this.registerCapability('onoff', 'BASIC', {
			getOpts: {
				getOnStart: true, // get the initial value on app start (only use for non-battery devices)
				//pollInterval: 'poll_interval' // maps to device settings
				// getOnOnline: true, // use only for battery devices
			},
		});

		this.registerCapability('measure_power', 'METER');
		this.registerCapability('meter_power', 'METER');
	}
	
}

module.exports = ZW116;