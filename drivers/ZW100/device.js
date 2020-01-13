'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecMultiSensorSixDevice extends ZwaveDevice {

	onMeshInit() {
		this._cancellationTimeout = this.getSetting('tamper_cancellation');

		this.registerCapability('measure_battery', 'BATTERY');

		this.registerCapability('alarm_motion', 'SENSOR_BINARY');
		this.registerCapability('alarm_tamper', 'NOTIFICATION', {
			reportParser: report => {
                if ((report && report['Notification Type'] === 'Home Security' ||
                    report['Notification Type'] === 'Burglar') &&
                    report.hasOwnProperty('Event (Parsed)')) {

                    if (report['Event (Parsed)'] === 'Tampering, Product covering removed' ||
                        report['Event (Parsed)'] === 'Tampering, Invalid Code' ||
                        report['Event (Parsed)'] === 'Tampering, Product Moved') {
                    	setTimeout(() => {
                    		this.setCapabilityValue('alarm_tamper', false);
						}, this._cancellationTimeout * 1000);
                        return true;
                    }
                    if (report['Event (Parsed)'] === 'Event inactive' && (!report.hasOwnProperty('Event Parameter') ||
                        report['Event Parameter'][0] === 3 ||
                        report['Event Parameter'][0] === 4 ||
                        report['Event Parameter'][0] === 9)) {
                        return false;
                    }
                }
                return null;
            }
		});

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_ultraviolet', 'SENSOR_MULTILEVEL');

		this.registerSetting('201', (value) => {
			return new Buffer([Math.round(value*10), 1]);
		});
	}

	onSettings(oldSettings, newSettings, changedKeys) {
        if (changedKeys.includes('tamper_cancellation')) {
			this._cancellationTimeout =  this.getSetting('tamper_cancellation');
		}

		return super.onSettings(oldSettings, newSettings, changedKeys);
    }
}

module.exports = AeotecMultiSensorSixDevice;
