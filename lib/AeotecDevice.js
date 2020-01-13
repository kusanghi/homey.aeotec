'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const MeshDriverUtil = require('homey-meshdriver').Util;

const constants = require('./constants');
const RETRY_GET_CONFIG = 3;

/**
 * This class adds basic functionality related to most if not all Qubino devices, it detects the devices
 * multi channel endpoint structure, configures its multi channel association reporting accordingly and handles some
 * very common settings.
 */
class AeotecDevice extends ZwaveDevice {
	async onMeshInit() {

		this.setUnavailable(Homey.__('pairing.configuring'));

		this.printNode();

		// Register common settings
		this.registerSettings();

		this._inputs = {};

		// Get number of multi channel nodes
		this.numberOfMultiChannelNodes = Object.keys(this.node.MultiChannelNodes || {}).length;

		// Detect temperature sensor
		this.temperatureSensorEnabled = typeof this.findTemperatureSensorEndpoint() === 'number';

		this.log('MultiChannelNodes:', this.numberOfMultiChannelNodes);
		this.log('MultiChannelConfiguration:', this.multiChannelConfigurationDisabled ? 'disabled' : 'enabled');
		this.log('TemperatureSensor:', this.temperatureSensorEnabled ? 'connected' : 'not connected');

		// Reset power meter values on button press
		if (this.hasCapability('resetMeter')) this.registerCapabilityListener('resetMeter', this.resetMeter.bind(this));

		// Get reference to driver
		this.driver = this.getDriver();

		// Configure multi channel reporting if necessary
		if (!this.multiChannelConfigurationDisabled) {
			try {
				await this._configureReporting();
			} catch (err) {
				this.error('failed to configure reporting', err);
			}
		}

		// Register configuration dependent capabilities
		await this.registerCapabilities();

		// Register temperature sensor endpoint
		this.registerTemperatureSensorEndpoint();

		// Register input endpoints
		await this.registerInputs();

		// Finally device is ready to be used, mark as available
		this.setAvailable();
	}

	/**
	 * Stub method which can be overridden by devices which do not support the new multi channel device structure of
	 * Qubino.
	 * @returns {boolean}
	 */
	get multiChannelConfigurationDisabled() {
		return false;
	}

	/**
	 * Get method that will return an object with the multi channel node id property if needed, else it will return
	 * an empty object.
	 * @returns {*}
	 */
	get multiChannelNodeObject() {
		if (this.numberOfMultiChannelNodes === 0 || this.multiChannelConfigurationDisabled) return {};
		return {
			multiChannelNodeId: this.findRootDeviceEndpoint(),
		};
	}

	/**
	 * Overrides registerCapability. This method ass the multiChannelNodeObject to the userOpts part of the
	 * registerCapability call (if necessary), it also checks if a device has a capability before trying to register it.
	 * @param args
	 */
	registerCapability(...args) {
		if (this.hasCapability(args[0])) {
			if (args.length >= 2) args[2] = Object.assign(this.multiChannelNodeObject, args[2]);
			else if (args.length === 1) args.push(this.multiChannelNodeObject);
			super.registerCapability(...args);
		}
	}

	/**
	 * Method that resets the accumulated power meter value on the node. It tries to find the root node of the device
	 * and then looks for the COMMAND_CLASS_METER.
	 * @returns {*}
	 */
	resetMeter() {
		const multiChannelRootNodeId = this.findRootDeviceEndpoint();
		const commandClassMeter = this.getCommandClass(constants.commandClasses.meter, multiChannelRootNodeId);
		if (commandClassMeter && commandClassMeter.hasOwnProperty(constants.commandClasses.commands.meterReset)) {
			return new Promise((resolve, reject) => {
				commandClassMeter[constants.commandClasses.commands.meterReset]({}, (err, result) => {
					if (err || result !== 'TRANSMIT_COMPLETE_OK') return reject(err || result);
					return resolve();
				});
			});
		}
		return Promise.reject(new Error('missing_meter_reset_command'));
	}

	/**
	 * When settings have been changed that change the device structure notify the user of requirement to re-pair.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {{en: string, nl: string}}
	 */
	customSaveMessage(oldSettings, newSettings, changedKeysArr = []) {
		if (changedKeysArr.includes(constants.settings.enableInput1) ||
			changedKeysArr.includes(constants.settings.enableInput2) ||
			changedKeysArr.includes(constants.settings.enableInput3) ||
			changedKeysArr.includes(constants.settings.functionalityInput3) ||
			changedKeysArr.includes(constants.settings.thermostatMode) ||
			changedKeysArr.includes(constants.settings.workingMode)) {
			return Homey.__('settings.re_pair_required');
		}
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return an array with the multi channel node ids
	 * of the found input sensor endpoints.
	 * @returns {Array}
	 */
	findInputSensorEndpoints() {
		const foundEndpoints = [];
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.sensorBinary ||
				this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.sensorNotification) {
				foundEndpoints.push(Number(i));
			}
		}
		return foundEndpoints;
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return the multi channel node id of the found
	 * endpoint that supports the temperature sensor.
	 * @returns {*}
	 */
	findTemperatureSensorEndpoint() {
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.sensorMultilevel) {
				return Number(i);
			}
		}
		return null;
	}

	/**
	 * Method that registers the temperature sensor endpoint and capability if applicable.
	 */
	registerTemperatureSensorEndpoint() {
		const temperatureSensorEndpoint = this.findTemperatureSensorEndpoint();
		if (typeof temperatureSensorEndpoint === 'number') {
			this.log('Configured temperature sensor on multi channel node', temperatureSensorEndpoint);
			this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel, {
				multiChannelNodeId: temperatureSensorEndpoint,
			});
		}
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return the multi channel node id of the found
	 * endpoint that supports the basic device controls.
	 * @returns {*}
	 */
	findRootDeviceEndpoint() {
		if (this.numberOfMultiChannelNodes === 0) return null;
		const rootDeviceClassGeneric = this.rootDeviceClassGeneric;
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.switchBinary ||
				this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.switchMultilevel ||
				(typeof rootDeviceClassGeneric === 'string' &&
					this.node.MultiChannelNodes[i].deviceClassGeneric === rootDeviceClassGeneric)) {
				return Number(i);
			}
		}
		return null;
	}

	/**
	 * Method that reads the inputConfiguration array of a device and based on that will register the input endpoints.
	 * If the configuration of the endpoints is not know it will be fetched (configurationGet) once.
	 * @returns {Promise<void>}
	 */
	async registerInputs() {
		this.log('Registering inputs...');

		const inputSensorEndpoints = this.findInputSensorEndpoints();
		if (!Array.isArray(inputSensorEndpoints) || inputSensorEndpoints.length === 0) {
			this.log('No enabled input endpoints found');
			return;
		}
		this.log('Found sensor endpoints', inputSensorEndpoints);

		const inputConfig = this.inputConfiguration;
		if (!Array.isArray(inputConfig)) {
			this.log('Missing input configuration');
			return;
		}

		for (const input of inputConfig) {
			if (!input.hasOwnProperty('defaultEnabled') || input.defaultEnabled === false) {
				const storeKey = `enableInput${input.id}`;
				input.enabled = this.getSetting(storeKey) > 0;
				if (input.enabled !== true && input.enabled !== false || typeof this.getStoreValue(storeKey) !== 'number') {

					// Get configuration parameter value for input enabled setting
					const payload = await this.safeConfigurationGet(input.parameterIndex);
					if (payload === null) {
						this.error('Failed to get input parameter value, aborting...');
						return;
					}

					// Parse the received payload
					const parsedPayload = this._parseInputParameterPayload(payload, input.id);
					input.enabled = parsedPayload > 0;

					// Mark input as initialized to prevent future config parameter gets
					this.setStoreValue(storeKey, parsedPayload);

					// Finally save the fetched setting value
					this.setSettings({ [storeKey]: parsedPayload.toString() });
				}
			}

			// Input is enabled, get the first found mc endpoint
			if (input.enabled === true) {
				input.multiChannelEndpoint = inputSensorEndpoints.shift();
				this.registerInputEndpointListener(input.multiChannelEndpoint, input.id);
			}
		}
	}

	/**
	 * Method that registers a multi channel report listener for the specified endpoint and corresponding input.
	 * @param inputSensorEndpoint
	 * @param inputId
	 */
	registerInputEndpointListener(inputSensorEndpoint, inputId) {
		this.log(`Configured input sensor ${inputId} on multi channel node ${inputSensorEndpoint}`);

		this._inputs[inputSensorEndpoint] = constants.inputMap[inputId];

		this.registerMultiChannelReportListener(
			inputSensorEndpoint,
			constants.commandClasses.sensorBinary,
			constants.commandClasses.sensorBinaryReport,
			(...args) => this.processInputEvent(inputSensorEndpoint, ...args));

		this.registerMultiChannelReportListener(
			inputSensorEndpoint,
			constants.commandClasses.notification,
			constants.commandClasses.notificationReport,
			(...args) => this.processInputEvent(inputSensorEndpoint, ...args));
	}

	/**
	 * Method that acts as a wrapper for configurationGet, it adds retrying (which is sometimes needed, since devices
	 * do not always respond), and does some error handling.
	 * @param index
	 * @param retryOverride
	 * @returns {Promise<*>}
	 */
	async safeConfigurationGet(index, retryOverride = RETRY_GET_CONFIG) {
		let result;
		for (let i = 0; i < retryOverride; ++i) {
			try {
				result = await this.configurationGet({ index });
				break;
			} catch (err) {
				this.error(`failed to get configuration parameter ${index}, retrying (${i + 1}/${retryOverride})`);
			}
		}
		if (!result) {
			this.error(`failed to get configuration parameter ${index}`);
			return null;
		}

		this.log(`got configuration parameter ${index}: ${result}`);
		return result;
	}

	/**
	 * Method that processes a notification report and triggers the corresponding Flow.
	 * @param inputSensorEndpoint
	 * @param report
	 * @private
	 */
	processInputEvent(inputSensorEndpoint, report) {
		if (!inputSensorEndpoint) throw new Error('missing_input_sensor_endpoint');
		if (!report || (!report.hasOwnProperty('Event (Parsed)') && !report.hasOwnProperty('Sensor Value'))) return;
		let newState = null;

		// Determine new state from sensor binary report or notification report
		if (report.hasOwnProperty('Sensor Value')) {
			newState = (report['Sensor Value'] === 'detected an event');
		} else if (report.hasOwnProperty('Event (Parsed)')) {
			newState = (report['Event (Parsed)'] !== 'Event inactive');
		}
		if (newState === null) return;

		// Get input object
		const inputObj = this._inputs[inputSensorEndpoint];
		if (!inputObj) throw new Error(`unknown_input_sensor_endpoint_${inputSensorEndpoint}`);
		if (inputObj.state === newState) return; // Do nothing when state did not change
		inputObj.state = newState;

		this.log(`Received notification from input ${inputObj.inputId}: ${newState}`);

		// Always trigger toggle
		this.driver.triggerFlow(inputObj.flowTriggers.toggle, this);

		// Trigger flow based on state
		if (newState) {
			this.driver.triggerFlow(inputObj.flowTriggers.on, this);
		} else {
			this.driver.triggerFlow(inputObj.flowTriggers.off, this);
		}
	}

	/**
	 * Override onSettings to handle combined z-wave settings.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {Promise<T>}
	 */
	async onSettings(oldSettings, newSettings, changedKeysArr) {

		// Handle all on/all off settings
		if (changedKeysArr.includes(constants.settings.allOn) || changedKeysArr.includes(constants.settings.allOff)) {
			const allOnAllOf = AeotecDevice._combineAllOnAllOffSettings(newSettings);
			const allOnAllOfSize = this.allOnAllOffSize || constants.settings.size.allOnAllOff;
			await this.configurationSet({
				index: constants.settings.index.allOnAllOff,
				size: allOnAllOfSize,
				signed: allOnAllOfSize !== 1,
			}, allOnAllOf);

			// Remove all on all off changed keys
			changedKeysArr = [...changedKeysArr.filter(changedKey => changedKey !== constants.settings.allOn && changedKey !== constants.settings.allOff)];
		}

		return super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * Combine two settings (all on/all off) into one value.
	 * @param newSettings
	 * @returns {number}
	 * @private
	 */
	static _combineAllOnAllOffSettings(newSettings) {
		const allOn = newSettings[constants.settings.allOn];
		const allOff = newSettings[constants.settings.allOff];
		if (allOn && allOff) return 255;
		else if (allOn && !allOff) return 2;
		else if (!allOn && allOff) return 1;
		return 0;
	}

	/**
	 * Method that will configure reporting in case the device has multi channel nodes and it has not been configured
	 * yet. In that case it will try to set association group 1 to '1.1` which enables multi channel node reporting.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _configureReporting() {
		if (this.numberOfMultiChannelNodes > 0 && !this.getSetting(constants.settings.multiChannelReportingConfigured)) {
			try {
				await this._configureMultiChannelReporting();
			} catch (err) {
				this.error('Failed configure reporting', err);
				this.setUnavailable(Homey.__('error.missing_multi_channel_command_class'));
			}
			this.setSettings({ [constants.settings.multiChannelReportingConfigured]: true });
		}
	}

	/**
	 * Method that will first remove any present association in group 1 and will then set association group 1 to '1.1'.
	 * @returns {Promise<boolean>}
	 * @private
	 */
	async _configureMultiChannelReporting() {
		if (this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL_ASSOCIATION) {
			if (this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL_ASSOCIATION.MULTI_CHANNEL_ASSOCIATION_SET) {
				await this.node.CommandClass.COMMAND_CLASS_ASSOCIATION.ASSOCIATION_REMOVE(new Buffer([1, 1]));
				await this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL_ASSOCIATION.MULTI_CHANNEL_ASSOCIATION_SET(
					new Buffer([1, 0x00, 1, 1])
				);
				await this.setSettings({ zw_group_1: '1.1' });
				this._debug('configured multi channel node reporting');
				return true;
			}
		}
		throw new Error('multi_channel_association_not_supported');
	}

	/**
	 * Method that safely parses a received configuration get payload.
	 * @param payload
	 * @returns {*}
	 * @private
	 */
	_parseInputParameterPayload(payload) {
		try {
			return payload['Configuration Value'][0];
		} catch (err) {
			this.error(`_parseInputParameterPayload() -> failed to parse payload (${payload})`);
			return 0;
		}
	}

	/**
	 * Method that handles the parsing of many shared settings.
	 */
	registerSettings() {

		// Invert restore status value
		this.registerSetting(constants.settings.restoreStatus, value => !value);

		// Multiply temperature sensor threshold by 10
		this.registerSetting(constants.settings.temperatureSensorReportingThreshold, value => value * 10);

		// Map temperature calibration value
		this.registerSetting(constants.settings.temperatureSensorOffset, value => {
			if (value === 0) return 32536;

			// -10 till -0.1 becomes 1100 till 1001
			if (value < 0) return MeshDriverUtil.mapValueRange(-10, -0.1, 1100, 1001, value);

			// 10 till 0.1 becomes 100 till 1
			return MeshDriverUtil.mapValueRange(10, 0.1, 100, 1, value);
		});
	}
}

module.exports = AeotecDevice;