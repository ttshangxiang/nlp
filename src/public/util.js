
var loginUrl = require('../../deploy_conf/config').loginUrl;

module.exports = {
	alert : function (msg) {
		alert (msg);
	},
	ajax: function (options) {
		var error = options.error;
		options.error = function (err) {
			if (err.status === 403) {
				window.location.href = loginUrl;
			}
			error && error(err);
		}
		$.ajax(options);
	}
}