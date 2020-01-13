'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW122 extends ZwaveDevice {
	
	onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		
		this.registerCapability('measure_battery', 'BATTERY');

		this.registerCapability('alarm_tamper', 'NOTIFICATION');
		this.registerCapability('alarm_water', 'NOTIFICATION');

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
	}
	
}

module.exports = ZW122;