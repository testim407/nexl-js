const CONF_FILES = {
	SETTINGS: 'settings.js', // general settings
	USERS: 'users.js', // users, passwords ( encrypted ), tokens etc...
	ADMINS: 'admins.js', // administrators list
	PERMISSIONS: 'permissions.js' // permissions matrix
};

// --------------------------------------------------------------------------------
// available options for SETTINGS
const SETTINGS = {
	JS_FILES_ROOT_DIR: 'js-files-root-dir',
	JS_FILES_ENCODING: 'js-files-encoding',
	HTTP_TIMEOUT: 'http-timeout-sec',
	LDAP_URL: 'ldap-url',
	LDAP_BASE_DN: 'ldap-base-dn',
	LDAP_BIND_DN: 'ldap-bind-dn',
	LDAP_BIND_PASSWORD: 'ldap-bind-password',
	LDAP_FIND_BY: 'ldap-find-by',

	HTTP_BINDING: 'http-binding',
	HTTP_PORT: 'http-port',
	HTTPS_BINDING: 'https-binding',
	HTTPS_PORT: 'https-port',
	SSL_CERT_LOCATION: 'ssl-cert-location',
	SSL_KEY_LOCATION: 'ssl-key-location',

	LOG_FILE_LOCATION: 'log-file-location',
	LOG_LEVEL: 'log-level',
	LOG_ROTATE_FILE_SIZE: 'log-rotate-file-size-kb',
	LOG_ROTATE_FILES_COUNT: 'log-rotate-files-count'
};

// --------------------------------------------------------------------------------

const NEXL_HOME_DEF = 'nexl-home';
const ENCODING_UTF8 = 'utf8';
const ENCODING_ASCII = 'ascii';
const AVAILABLE_ENCODINGS = [ENCODING_UTF8, ENCODING_ASCII];


// --------------------------------------------------------------------------------
const CONF_CONSTANTS = {};
CONF_CONSTANTS.CONF_FILES = CONF_FILES;
CONF_CONSTANTS.SETTINGS = SETTINGS;
CONF_CONSTANTS.NEXL_HOME_DEF = NEXL_HOME_DEF;

CONF_CONSTANTS.ENCODING_UTF8 = ENCODING_UTF8;
CONF_CONSTANTS.ENCODING_ASCII = ENCODING_ASCII;
CONF_CONSTANTS.AVAILABLE_ENCODINGS = AVAILABLE_ENCODINGS;

// --------------------------------------------------------------------------------

// backend module support
if (typeof module !== 'undefined') {
	module.exports = CONF_CONSTANTS;
}