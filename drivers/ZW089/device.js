'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecRecessedContactDevice extends ZwaveDevice {
	
	onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		
		this.registerCapability('measure_battery', 'BATTERY');
		this.registerCapability('alarm_contact', 'SENSOR_BINARY');
	}
	
}

module.exports = AeotecRecessedContactDevice;