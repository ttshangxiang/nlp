
// 热加载
if (module.hot) {
    module.hot.accept();
}

require('../css/index.less');
var $ = require('jquery');
var template = require('../lib/template');
// require('../lib/mockjsTpl');

// 转义
template.helper('encodeURIComponent', function (str) {
    return encodeURIComponent(str);
});

$(function () {
    var init1 = require('../page/nlp_uncleared');
    var init2 = require('../page/nlp_group');
    var init3 = require('../page/data_count');
    var init4 = require('../page/yongxin_shouxin');
    var init5 = require('../page/yongxin_fangkuan');

    $('#tree a.tree-text').click(function () {
        var $this = $(this);
        var id = $this.attr('data-for');
        $('#' + id).removeClass('hide').siblings('.center').addClass('hide');
        if (id === 'card-1') {
            init1();
        }
        if (id === 'card-2') {
            init2();
        }
        if (id === 'card-3') {
            init3();
        }
        if (id === 'card-4') {
            init4();
        }
        if (id === 'card-5') {
            init5();
        }
    });
});
