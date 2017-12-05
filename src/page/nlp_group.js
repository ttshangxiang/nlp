
var $ = require('jquery');
var template = require('../lib/template');
var util = require('../public/util');

require('../lib/Mricode-Pagination/mricode.pagination.js');
require('../css/pagination.less');

var query = {
    page: 0,
    count: 20,
    totalCount: 0
};

// 渲染分页
var pageInit = function () {
    $('#paginationGroup2').pagination({
        pageIndex: query.page || 0,
        pageSize: query.count,
        total: query.totalCount,
        debug: false,
        loadFirstPage: false,
        remote: {},
        pageElementSort: ['$page']
    });
};
// 渲染当前页面
var renderPage = function (list, total, msg) {
    $('#nlp-group').html(template('nlp-group-tpl', {
        data: list,
        total: total,
        msg: msg,
        pageSize: query.count
    }));
};

var getParam = function () {
    var param = {
        offset: query.page * query.count,
        count: query.count
    };
    $('#card-2 input').each(function () {
        var $el = $(this);
        var value = $el.val();
        if (value) {
            param[$el.attr('name')] = value
        }
    });
    return param;
};

var getGroup = function () {
    loaded = true;
    var param = getParam();
    $('#card-2 .empty-main').hide();
    $('#card-2 .detail-loading').show();
    util.ajax({
        url: '/api/nanjing/group',
        data: param,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.data && res.data.data) {
                query.totalCount = res.data['total_count'];
                renderPage(res.data.data, query.totalCount);
                // 分页
                pageInit();
            } else {
                renderPage([], 0, res.msg || '加载失败');
            }
            $('#card-2 .detail-loading').hide();
        },
        error: function () {
            renderPage([], 0, '加载失败');
            $('#card-2 .detail-loading').hide();
        }
    });
};

var loaded = false;
var groupInit = function () {
    !loaded && getGroup();
};

var showMember = function () {
    var $this = $(this);
    var id = $this.attr('data-id');
    var status = $this.attr('data-status');
    if (status === '+') {
        $this.attr('data-status', '');
        getMember(id, function (data) {
            var html = template('nlp-member-tpl', {data: data, groupId: id});
            $this.parent().after(html);
            $this.attr('data-status', '-');
            $this.find('a').html('-');
        });
    } else if (status === '-') {
        $('#nlp-group .member-' + id).remove();
        $this.attr('data-status', '+');
        $this.find('a').html('+');
    }
};

var memberCache = {};
var getMember = function (id, callback) {
    if (memberCache[id]) {
        callback(memberCache[id]);
        return;
    }
    util.ajax({
        url: '/api/nanjing/member?id=' + id,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.status === 0) {
                memberCache[id] = res.data;
                callback(res.data);
            } else {
                callback([]);
            }
        },
        error: function () {
            callback([]);
        }
    });
}

module.exports = groupInit;

$(function () {

    $('#card-2').on('pageClicked', '#paginationGroup2', function (event, data) {
        query.page = data.pageIndex;
        getGroup();
    });

    $('#nlp-group-query').click(function () {
        query.page = 0;
        getGroup();
    });

    $('#nlp-group-reset').click(function () {
        $('#card-2 input').each(function () {
            $(this).val('');
        });
    });

    $('#nlp-group').on('click', '.show-member', showMember);

});