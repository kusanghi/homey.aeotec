'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecFourInOneDevice extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('measure_battery', 'BATTERY');
		this.registerCapability('alarm_motion', 'BASIC');

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
        this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
        this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
    }
	
}

module.exports = AeotecFourInOneDevice;