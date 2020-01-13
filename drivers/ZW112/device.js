'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW112 extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('measure_batttery', 'BATTERY');
		this.registerCapability('alarm_contact', 'BASIC');
	}
	
}

module.exports = ZW112;