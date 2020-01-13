'use strict';

const Homey = require('homey');

class AeotecApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
	}
}

module.exports = AeotecApp;
