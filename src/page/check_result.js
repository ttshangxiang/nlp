
var $ = require('jquery');
var template = require('../lib/template');
var util = require('../public/util');

require('../lib/Mricode-Pagination/mricode.pagination.js');
require('../css/pagination.less');

var query = {
    page: 0,
    count: 20,
    totalCount: 0,
    type: ''
};

// 渲染分页
var pageInit = function () {
    $('#paginationGroup6').pagination({
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
    $('#nlp-check-result').html(template('nlp-check-result-tpl', {
        data: list,
        total: total,
        msg: msg,
        pageSize: query.count,
        indexStart: query.count * query.page,
        type: query.type
    }));
};

var getParam = function () {
    var param = {
        offset: query.page * query.count,
        count: query.count
    };
    if (query.type) {
        param.identify = query.type;
    }
    return param;
};

var getCheckResult = function () {
    var param = getParam();
    $('#card-6 .empty-main').hide();
    $('#card-6 .detail-loading').show();
    util.ajax({
        url: '/api/nanjing/check_result',
        data: param,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.data && res.data.data) {
                query.totalCount = res.data['total_count'];
                renderPage(res.data.data, query.totalCount);
                // 分页
                pageInit();
                if (res.data.data[0]) {
                    var patchdate = res.data.data[0].patchdate || '-';
                    if (patchdate.length == 8) {
                        patchdate = patchdate.substr(0, 4) + '年' + patchdate.substr(4, 2) + '月', + patchdate(6) + '日';
                    }
                    $('#patchdate').html('(数据日期：' + patchdate + ')');
                }
            } else {
                renderPage([], 0, res.msg || '加载失败');
            }
            $('#card-6 .detail-loading').hide();
        },
        error: function () {
            renderPage([], 0, '加载失败');
            $('#card-6 .detail-loading').hide();
        }
    });
};

var checkResultInit = function (type) {
    var pageTitle = '核对结果列表';
    if (type == 'A') {
        pageTitle = '评级' + pageTitle;
    }
    if (type == 'B') {
        pageTitle = '授信' + pageTitle;
    }
    if (type == 'D') {
        pageTitle = '授信调整' + pageTitle;
    }
    if (type == 'F') {
        pageTitle = '用信' + pageTitle;
    }
    if (type == 'X') {
        pageTitle = '用信vs放款' + pageTitle;
    }
    if (type == 'Y') {
        pageTitle = '授信vs用信' + pageTitle;
    }
    $('#card-6 .center-title').html(pageTitle);
    var url = '/api/export/check_result?identify=' + type;
    $('#export-check-result').attr('href', url);
    query.type = type;
    query.page = 0;
    getCheckResult();
};

module.exports = checkResultInit;

$(function () {

    $('#card-6').on('pageClicked', '#paginationGroup6', function (event, data) {
        query.page = data.pageIndex;
        getCheckResult();
    });
});