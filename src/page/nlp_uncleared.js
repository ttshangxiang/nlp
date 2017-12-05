
var $ = require('jquery');
var template = require('../lib/template');
require('../lib/Mricode-Pagination/mricode.pagination.js');
require('../css/pagination.less');
var util = require('../public/util');

var query = {
    page: 0,
    count: 20,
    totalCount: 0
};

// 渲染分页
var pageInit = function () {
    $('#paginationGroup').pagination({
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
    $('#nlp-uncleared').html(template('nlp-uncleared-tpl', {
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
    $('#card-1 input, #card-1 select').each(function () {
        var $el = $(this);
        var value = $el.val();
        if (value) {
            param[$el.attr('name')] = value
        }
    });

    return param;
};

var getUnCleared = function () {
    loaded = true;
    var param = getParam();
    $('#card-1 .empty-main').hide();
    $('#card-1 .detail-loading').show();
    util.ajax({
        url: '/api/nanjing/uncleared',
        data: param,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.data && res.data.data) {
                query.totalCount = res.data['total_count'];
                renderPage(res.data.data, query.totalCount);
                // 分页
                if (res.data.data[0]) {
                    var patchdate = res.data.data[0].patchdate;
                    if (patchdate.length == 8) {
                        patchdate = patchdate.substr(0, 4) + '年' + patchdate.substr(4, 2) + '月', + patchdate(6) + '日';
                    }
                    $('#patchdate').html('(数据日期：' + patchdate + ')');
                }
                pageInit();
            } else {
                renderPage([], 0, res.msg || '加载失败');
            }
            $('#card-1 .detail-loading').hide();
        },
        error: function () {
            renderPage([], 0, '加载失败');
            $('#card-1 .detail-loading').hide();
        }
    });
};

var getBusinessType = function () {
    util.ajax({
        url: '/api/nanjing/businessType',
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.status === 0) {
                var list = res.data;
                var str = '<option value="">全部</option>';
                for (var i = 0; i < list.length; i++) {
                    str += '<option value="' + list[i].businessType + '">' + list[i].businessTypeName + '</option>';
                }
                $('#businessType').html(str);
            }
        },
        error: function () {
        }
    });
};

var loaded = false;
var unClearedInit = function () {
    if (!loaded) {
        getUnCleared();
        getBusinessType();
    }
};

module.exports = unClearedInit;

$(function () {

    $('#card-1').on('pageClicked', '#paginationGroup', function (event, data) {
        query.page = data.pageIndex;
        getUnCleared();
    });

    $('#nlp-uncleared-query').click(function () {
        query.page = 0;
        getUnCleared();
    });

    $('#nlp-uncleared-reset').click(function () {
        $('#card-1 input, #card-1 select').each(function () {
            $(this).val('');
        });
    });

    $('#card-1 input, #card-1 select').change(function () {
        var url = '/api/export/uncleared';
        var query = '';
        $('#card-1 input, #card-1 select').each(function () {
            var $el = $(this);
            var value = $el.val();
            if (value) {
                query += '&' + $el.attr('name') + '=' + value;
            }
        });
        if (query) {
            url += '?' + query.substr(1);
        }
        $('#export-uncleared').attr('href', url);
    });

    getUnCleared();
    getBusinessType();
});