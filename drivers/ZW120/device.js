'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW120 extends ZwaveDevice {

	onMeshInit() {
		//this.enableDebug();
		//this.printNode();

		this.registerCapability('measure_battery', 'BATTERY');

		this.registerCapability('alarm_contact', 'SENSOR_BINARY');
		this.registerCapability('alarm_tamper', 'NOTIFICATION', {
			reportParser: report => {
				if ((report && report['Notification Type'] === 'Home Security' ||
					report['Notification Type'] === 'Burglar') &&
					report.hasOwnProperty('Event (Parsed)')) {

					if (report['Event (Parsed)'] === 'Tampering, Product covering removed' ||
						report['Event (Parsed)'] === 'Tampering, Invalid Code' ||
						report['Event (Parsed)'] === 'Tampering, Product Moved') {
						return true;
					}
					if (report['Event (Parsed)'] === 'Event inactive') {
						return false;
					}
				}
				return null;
			}
		});
	}

}

module.exports = ZW120;
