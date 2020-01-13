'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW095 extends ZwaveDevice {

	onMeshInit() {
		this.enableDebug();
		this.printNode();

        this.registerCapability('measure_power', 'METER', {
            getOpts: {
				pollInterval: 30000,
			},
        });

        this.registerCapability('meter_power', 'METER', {
            getOpts: {
				pollInterval: 30000,
			},
        });

        this.registerCapability('measure_voltage', 'METER', {
            getOpts: {
				pollInterval: 30000,
			},
        });

        this.registerCapability('measure_current', 'METER', {
            getOpts: {
				pollInterval: 30000,
			},
        });
    }

}

module.exports = ZW095;