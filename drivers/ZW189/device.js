'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZW189 extends ZwaveDevice {
	
	onMeshInit() {
		this.registerSetting('82', value => new Buffer( [Number(!value)]))
	}
	
}

module.exports = ZW189;