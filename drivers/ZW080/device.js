'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class AeotecSirenDevice extends ZwaveDevice {

	onMeshInit() {
		this._alarmOnFlow = this.getDriver().alarmOnFlow;
		this._alarmOffFlow = this.getDriver().alarmOffFlow;

        this._changeSoundFlow = this.getDriver().changeSoundFlow;

		this.registerCapability('onoff', 'SWITCH_BINARY');
	}

	async onOffRunListener(args, state, on) {
		let value;
		on ? value = 255 : value = 0;

		if (this.node && this.node.CommandClass.COMMAND_CLASS_SWITCH_BINARY) {
				return await this.node.CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_SET({
					'Switch Value': value,
				});
		} else return Promise.reject('invalid_device_command_class');
	}

	async changeSoundRunListener(args, state) {
		let settingsValue, zwaveValue;

		if (args && args.sound && args.volume) {
			settingsValue = parseInt(args.sound) + parseInt(args.volume);
			zwaveValue = new Buffer(2);
			zwaveValue.writeUIntBE(settingsValue, 0, 2);

			try {
				await this.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
					'Parameter Number': 37,
					Level: {
						Size: 2,
						Default: false
					},
					'Configuration Value': zwaveValue
				});

				this.setSettings({
                    '37': settingsValue
				});
			} catch (err) {
				return Promise.reject(err);
            }
		}
	}
}

module.exports = AeotecSirenDevice;
