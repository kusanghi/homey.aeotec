'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW139 extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('onoff', 'BASIC', {
			getOpts: {
				getOnStart: true, // get the initial value on app start (only use for non-battery devices)
				//pollInterval: 'poll_interval' // maps to device settings
				// getOnOnline: true, // use only for battery devices
			},
		});
	}
	
}

module.exports = ZW139;