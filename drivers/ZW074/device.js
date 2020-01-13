'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecFourinOneGenFiveDevice extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('measure_battery', 'BATTERY');
		this.registerCapability('alarm_motion', 'SENSOR_BINARY');

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
        this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
        this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');

        this.registerSetting('41', value => new Buffer([value, 0]));
        this.registerSetting('42', value => new Buffer([value, 0]));
        this.registerSetting('43', value => new Buffer([value, 0]));
        this.registerSetting('44', value => new Buffer([value, 0]));
    }
	
}

module.exports = AeotecFourinOneGenFiveDevice;