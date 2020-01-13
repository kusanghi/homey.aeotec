'use strict';

const { ZwaveDevice } = require('homey-meshdriver');

class ZW141 extends ZwaveDevice {

	onMeshInit() {
		//this.enableDebug();
		//this.printNode();

		this.registerCapability('windowcoverings_state', 'SWITCH_BINARY');
		//this.registerCapability('dim', 'SWITCH_MULTILEVEL');
	}

}

module.exports = ZW141;
