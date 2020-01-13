'use strict';
const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZWA008 extends ZwaveDevice {

	onMeshInit() {
		//this.enableDebug();
		//this.printNode();

		this._sceneTrigger = this.getDriver().sceneTrigger;

		this.registerCapability('measure_battery', 'BATTERY');

		this.registerCapability('alarm_contact', 'NOTIFICATION');
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

		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', (report) => {
			if (report.hasOwnProperty('Properties1') &&
				report.Properties1.hasOwnProperty('Key Attributes') &&
				report.hasOwnProperty('Scene Number')) {
				const data = {
					button: report['Scene Number'].toString(),
					scene: report.Properties1['Key Attributes'],
				};
				this._sceneTrigger.trigger(this, null, data);
			}
		});
	}

	sceneRunListener(args, state) {
		if (!args) return Promise.reject('No arguments provided');
		if (!state) return Promise.reject('No state provided');

		if (args.hasOwnProperty('button') &&
			state.hasOwnProperty('button') &&
			args.hasOwnProperty('scene') &&
			state.hasOwnProperty('scene')) {
        		return (args.button === state.button && args.scene === state.scene);
		} return Promise.reject('Button or scene undefined in args or state');
	}
}

module.exports = ZWA008;
