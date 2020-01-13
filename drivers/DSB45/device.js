'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecWaterSensorDevice extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('alarm_water', 'SENSOR_BINARY');
		this.registerSetting('measure_battery', 'BATTERY');
	}
	
}

module.exports = AeotecWaterSensorDevice;