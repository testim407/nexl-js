const express = require('express');

const security = require('../../api/security');
const utils = require('../../api/utils');

const router = express.Router();

router.post('/resolve-status', function (req, res) {
	const username = utils.getLoggedInUsername(req);
	const status = {
		isLoggedIn: username !== utils.UNAUTHORIZED_USERNAME,
		isAdmin: security.isAdmin(username),
		hasReadPermission: security.hasReadPermission(username),
		hasWritePermission: security.hasWritePermission(username),
	};
	status['username'] = username;
	res.send(status);
});

router.post('/login', function (req, res) {
	const username = req.body.username;

	// if not authenticated, clear token and send error
	if (!security.isPasswordValid(username, req.body.password)) {
		utils.sendError(res, 'Bad credentials');
		return;
	}

	// encoding
	const token = utils.encrypt(username);

	// send it back to the client
	res.send(token);

	res.end();
});

// --------------------------------------------------------------------------------
module.exports = router;
// --------------------------------------------------------------------------------
