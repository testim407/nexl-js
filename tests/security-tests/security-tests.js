const assert = require('assert');

const testAPI = require('../test-api');
const confConsts = require('../../backend/common/conf-constants');
const confMgmt = require('../../backend/api/conf-mgmt');
const security = require('../../backend/api/security');
const securityConsts = require('../../backend/common/security-constants');

// --------------------------------------------------------------------------------

function init(predefinedNexlJSFIlesDir, tmpNexlJSFilesDir) {
	confMgmt.getNexlSettingsCached()[confConsts.SETTINGS.STORAGE_DIR] = tmpNexlJSFilesDir;

	return Promise.resolve();
}

function run() {
	if (security.isAdmin(securityConsts.ADMIN_USER)) {
		return Promise.resolve();
	} else {
		return Promise.reject();
	}
}

function done() {
	return Promise.resolve();
}

testAPI.startNexlApp(init, run, done);