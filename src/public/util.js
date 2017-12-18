
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
	},
	resetChart: function (id) {
		var dom = $('#' + id);
		var instance = echarts.getInstanceByDom(dom[0]);
		if (instance && !instance.isDisposed) {
			instance.dispose();
		}
		var parent = dom.parent();
		dom.remove();
		var newDom = $('<div class="charts" id="' + id + '"></div>');
		parent.append(newDom);
		return newDom;
	}
}