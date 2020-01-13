'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const sceneMap = {
	1: '_pressTrigger',
	2: '_holdTrigger'
};

class AeotecPanicButtonDevice extends ZwaveDevice {

	onMeshInit() {
		this._pressTrigger = this.getDriver().pressTrigger;
		this._holdTrigger = this.getDriver().holdTrigger;

		this.registerCapability('measure_battery', 'BATTERY');

		this.registerReportListener('SCENE_ACTIVATION', 'SCENE_ACTIVATION_SET', (report) => {
			if (report && report['Scene ID']) {
                let trigger = sceneMap[report['Scene ID']];
                this[trigger].trigger(this, null, null);
			}
		});
	}

}

module.exports = AeotecPanicButtonDevice;
