'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const zwaveUtils = require('homey-meshdriver').Util;

class ZW121 extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('onoff', 'BASIC');
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');

		this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], async (values, options) => {
			let hue, saturation, value;
            typeof values.light_hue === 'number' ? hue = values.light_hue : hue = this.getCapabilityValue('light_hue');
            typeof values.light_saturation === 'number' ? saturation = values.light_saturation : saturation = this.getCapabilityValue('light_saturation');
            value = this.getCapabilityValue('dim');

            let rgb = zwaveUtils.convertHSVToRGB({hue, saturation, value});

            return await this._sendColors({red: rgb.red, green: rgb.green, blue: rgb.blue, warm: 0, cold: 0});
		});

		this.registerCapabilityListener('light_temperature', async (value, options) => {
			let cold = (1 - value) * 255;
			let warm = value * 255;

			return await this._sendColors({red: 0, green: 0, blue: 0, warm, cold});
		});

		this.registerCapabilityListener('light_mode', async (value, options) => {
			if (value === 'temperature') {
                let cold = (1 - this.getCapabilityValue('light_temperature')) * 255;
                let warm = this.getCapabilityValue('light_temperature') * 255;

                return await this._sendColors({red: 0, green: 0, blue: 0, warm, cold});
			} else {
                let hue, saturation, value;
                hue = this.getCapabilityValue('light_hue');
                saturation = this.getCapabilityValue('light_saturation');
                value = this.getCapabilityValue('dim');

                let rgb = zwaveUtils.convertHSVToRGB({hue, saturation, value});

                return await this._sendColors({red: rgb.red, green: rgb.green, blue: rgb.blue, warm: 0, cold: 0});
			}
		});
	}

	async _sendColors({red, green, blue, warm, cold}) {
        return await this.node.CommandClass.COMMAND_CLASS_SWITCH_COLOR.SWITCH_COLOR_SET({
            Properties1: {
                'Color Component Count': 5
            },
            vg1: [
                {
                    'Color Component ID': 0,
                    Value: warm
                },
                {
                    'Color Component ID': 1,
                    Value: cold
                },
                {
                    'Color Component ID': 2,
                    Value: red
                },
                {
                    'Color Component ID': 3,
                    Value: green
                },
                {
                    'Color Component ID': 4,
                    Value: blue
                },
            ]
        });
	}
}

module.exports = ZW121;