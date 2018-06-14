const express = require('express');
const router = express.Router();

const utils = require('../../api/utils');
const security = require('../../api/security');
const cmdLineArgs = require('../../api/cmd-line-args');
const confMgmt = require('../../api/conf-mgmt');
const logger = require('../../api/logger');

const NEXL_HOME_DIR = 'nexl-home-dir';

router.post('/avail-values', function (req, res, next) {
	const data = {
		logLevels: logger.getAvailLevels(),
		encodings: confMgmt.AVAILABLE_ENCODINGS
	};

	res.send(data);
});

router.post('/load', function (req, res, next) {
	const username = utils.getLoggedInUsername(req);
	logger.log.debug('Loading settings for [%s] user', username);

	if (!security.isAdmin(username)) {
		logger.log.error('The [%s] user doesn\'t have admin permissions to load settings', username);
		utils.sendError(res, 'admin permissions required');
		return;
	}

	const settings = confMgmt.getCached(confMgmt.CONF_FILES.SETTINGS);
	settings[NEXL_HOME_DIR] = confMgmt.getNexlHomeDir();
	res.send(settings)
});

router.post('/save', function (req, res, next) {
	const username = utils.getLoggedInUsername(req);
	logger.log.debug('Saving settings for [%s] user', username);

	if (!security.isAdmin(username)) {
		logger.log.error('The [%s] user doesn\'t have admin permissions to save settings', username);
		utils.sendError(res, 'admin permissions required');
		return;
	}

	const data = req.body;
	delete data[NEXL_HOME_DIR];
	logger.log.level = data['log-level'];

	return confMgmt.saveSettings(data).then(
		() => res.send({})).catch(
		(err) => {
			logger.log.error('Failed to save settings. Reason : [%s]', err);
			utils.sendError(res, err);
		});
});

router.post('/*', function (req, res, next) {
	utils.sendError(res, 'Service not found', 404);
});

router.get('/*', function (req, res, next) {
	utils.sendError(res, 'Service not found', 404);
});

// --------------------------------------------------------------------------------
module.exports = router;
// --------------------------------------------------------------------------------
