
var $ = require('jquery');
var template = require('../lib/template');
require('../lib/Mricode-Pagination/mricode.pagination.js');
require('../css/pagination.less');

var query = {
    page: 0,
    count: 15,
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
    $('#card-1 input').each(function () {
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
    $.ajax({
        url: '/nanjing/uncleared',
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
            $('#card-1 .detail-loading').hide();
        },
        error: function () {
            renderPage([], 0, '加载失败');
            $('#card-1 .detail-loading').hide();
        }
    });
};

var loaded = false;
var unClearedInit = function () {
    !loaded && getUnCleared();
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
        $('#card-1 input').each(function () {
            $(this).val('');
        });
    });

    getUnCleared();
});