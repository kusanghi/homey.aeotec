'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW078 extends ZwaveDevice {

	onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		
		this.registerCapability('onoff', 'SWITCH_BINARY');

        this.registerCapability('measure_power', 'METER');
        this.registerCapability('meter_power', 'METER');
    }

}

module.exports = ZW078;
