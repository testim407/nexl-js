const express = require('express');
const router = express.Router();
const path = require('path');

const util = require('util');
const j79 = require('j79-utils');

const version = require('./../../../package.json').version;

const utils = require('../../api/utils');
const security = require('../../api/security');
const confMgmt = require('../../api/conf-mgmt');
const logger = require('../../api/logger');

router.post('/info', function (req, res, next) {
	res.send({
		SLASH: path.sep,
		OS: process.platform,
		VERSION: version
	});
});

// --------------------------------------------------------------------------------
module.exports = router;
// --------------------------------------------------------------------------------