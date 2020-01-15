'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW095 extends ZwaveDevice {

	onMeshInit() {
		// enable debugging
		this.enableDebug();

		// print the node's info to the console
        this.printNode();
        
        this.registerCapability('measure_power', 'METER', {
            getOpts: {
                getOnStart: true,
				pollInterval: 30000,
			},
        });

        this.registerCapability('meter_power', 'METER', {
            getOpts: {
                getOnStart: true,
				pollInterval: 30000,
			},
        });

        this.registerCapability('measure_voltage', 'METER', {
            getOpts: {
                getOnStart: true,
				pollInterval: 30000,
			},
        });

        this.registerCapability('measure_current', 'METER', {
            getOpts: {
                getOnStart: true,
				pollInterval: 30000,
			},
        });
    }

}

module.exports = ZW095;