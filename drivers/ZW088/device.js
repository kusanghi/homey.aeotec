'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const sceneMap = {
	1: '_press1Trigger',
    2: '_hold1Trigger',
    3: '_press2Trigger',
    4: '_hold2Trigger',
    5: '_press3Trigger',
    6: '_hold3Trigger',
    7: '_press4Trigger',
    8: '_hold4Trigger',
};

class AeotecKeyFobDevice extends ZwaveDevice {

	onMeshInit() {
		this._press1Trigger = this.getDriver().press1Trigger;
        this._press2Trigger = this.getDriver().press2Trigger;
        this._press3Trigger = this.getDriver().press3Trigger;
        this._press4Trigger = this.getDriver().press4Trigger;

        this._hold1Trigger = this.getDriver().hold1Trigger;
        this._hold2Trigger = this.getDriver().hold2Trigger;
        this._hold3Trigger = this.getDriver().hold3Trigger;
        this._hold4Trigger = this.getDriver().hold4Trigger;

        this.registerSetting('measure_battery', 'BATTERY', {
			pollInterval: 'poll_interval'
		});

		this.registerReportListener('SCENE_ACTIVATION', 'SCENE_ACTIVATION_SET', (report) => {
			if (report && report['Scene ID']) {
				let trigger = sceneMap[report['Scene ID']];
				this[trigger].trigger(this, null, null);
			}
		});
	}
}

module.exports = AeotecKeyFobDevice;
