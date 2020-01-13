'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const zwaveUtils = require('homey-meshdriver').Util;

class AeotecLEDBulbDevice extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('onoff', 'BASIC');
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');

		this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], async (values, options) => {
			let hue, saturation, dim;
			typeof values.light_hue === 'number' ? hue = values.light_hue : hue = this.getCapabilityValue('light_hue');
            typeof values.light_saturation === 'number' ? saturation = values.light_saturation : saturation = this.getCapabilityValue('light_saturation');
            dim = this.getCapabilityValue('dim');

            let rgb = zwaveUtils.convertHSVToRGB({hue: hue, saturation: saturation, value: dim});

			return await this._sendColors({red: rgb.red, green: rgb.green, blue: rgb.blue, warm: 0, cold: 0});
        });

		this.registerCapabilityListener('light_temperature', async (value, options) => {
			let cold, warm;

			value < .5 ? cold = this._map(0, 0.5, 255, 10, value) : cold = 0;
            value >= .5 ? warm = this._map(0.5, 1, 10, 255, value) : warm = 0;

            return await this._sendColors({red: 0, green: 0, blue: 0, warm, cold});
		});

		this.registerCapabilityListener('light_mode', async (value, options) => {
			if (value === 'temperature') {
                let cold, warm;

                this.getCapabilityValue('dim') < .5 ? cold = this._map(0, 0.5, 255, 10, this.getCapabilityValue('dim')) : cold = 0;
                this.getCapabilityValue('dim') >= .5 ? warm = this._map(0, 0.5, 255, 10, this.getCapabilityValue('dim')) : warm = 0;

                return await this._sendColors({red: 0, green: 0, blue: 0, warm, cold});
			} else {
                let hue, saturation, dim;
                hue = this.getCapabilityValue('light_hue');
                saturation = this.getCapabilityValue('light_saturation');
                dim = this.getCapabilityValue('dim');

                let rgb = zwaveUtils.convertHSVToRGB({hue: hue, saturation: saturation, value: dim});

                return await this._sendColors({red: rgb.red, green: rgb.green, blue: rgb.blue, warm: 0, cold: 0});
			}
		});

        this.registerSetting("80", (input) => new Buffer([(input) ? 2 : 0]));
        this.registerSetting("34", (input) => new Buffer([(input) ? 1 : 0]));
        this.registerSetting("35", (input) => new Buffer([(input) ? 1 : 0]));
    }

	_map(inputStart, inputEnd, outputStart, outputEnd, input) {
        return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
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

module.exports = AeotecLEDBulbDevice;