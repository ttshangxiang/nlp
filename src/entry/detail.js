
// 热加载
if (module.hot) {
    module.hot.accept();
}

require('../css/detail.less');
var $ = require('jquery');
var template = require('../lib/template');
var util = require('../public/util')
require('../public/template-helper');
// require('../lib/mockjsTpl');

// 渲染树
var renderTree = function (data, node) {
    var func = function (data, level, last) {
        str += '<div class="tree-node">';
        var line = '<div class="tree-line"></div>';
        if (last) {
            line = '';
            if (!data.children) {
                line = '<div class="tree-line-last"></div>';
            }
        }
        if (level === 0) {
            line = '';
        }
        var linev = '<div class="tree-line-v"></div>';
        if (level === 0) {
            linev = '';
        }
        str += line
            +'<div class="tree-content">'
            + linev;
        data.iconCls = data.iconCls || 'icon-tree-table';
        var expand = '';
        var iconStr = '<i class="tree-icon ' + data.iconCls + '"></i>';
        var fillStr = '';
        if (data.children) {
            expand = '<a href="javascript:;" class="tree-expand icon-tree-hide"></a>';
            iconStr = '';
            fillStr = '<div class="tree-fill"></div>'
        }
        str += expand
            + fillStr
            + '<a href="javascript:;" class="tree-text" data-id="' + data._id + '" id="' + data._id +'-catalog">'
            + iconStr
            + '<span>' + data.text + '</span>'
            + '</a>'
            + '</div>';
        if (data.children) {
            str += '<div class="tree-children">';
            for (var i = 0; i < data.children.length; i++) {
                var last = i === data.children.length - 1;
                func(data.children[i], level + 1, last);
            }
            str += '</div>';
        }
        str += '</div>';
    };
    var str = '';
    func(data, 0);
    node.html(str);
};

// 渲染评级
var renderNanjin1 = function (data) {
    $('#nanjing1').html(template('nanjing1-tpl', data).replace(/td>\s+<td/g, 'td><td'));
};
// 渲染授信
var renderNanjin2 = function (data) {
    $('#nanjing2').html(template('nanjing2-tpl', data).replace(/td>\s+<td/g, 'td><td'));
};
// 渲染授信调整
var renderNanjin3 = function (data) {
    $('#nanjing3').html(template('nanjing3-tpl', data).replace(/td>\s+<td/g, 'td><td'));
};
// 渲染用信
var renderNanjin4 = function (data) {
    $('#nanjing4').html(template('nanjing4-tpl', data).replace(/td>\s+<td/g, 'td><td'));
};
// 渲染用信与放款核对
var renderNanjinX = function (data) {
    $('#nanjingX').html(template('nanjingX-tpl', data).replace(/td>\s+<td/g, 'td><td'));
};
// 渲染用信与授信核对
var renderNanjinY = function (data) {
    $('#nanjingY').html(template('nanjingY-tpl', data).replace(/td>\s+<td/g, 'td><td'));
};

// 渲染所有
var renderAll = function (obj) {
    var node = $('#tree');
    renderTree(obj.tree, node);
    renderNanjin1({$value: obj.pingji[0]});
    renderNanjin2({list: obj.shouxin});
    renderNanjin3({list: obj.tiaozheng});
    renderNanjin4({list: obj.yongxin});
    renderNanjinY({list: obj.Y});
    renderNanjinX({list: obj.X});
};

function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  decodeURI(r[2]); return null;
}

var customerName = GetQueryString('name');
if (customerName) {
    customerName = decodeURIComponent(customerName);
    document.title = customerName + ' - 信贷语义识别';
    $('.company-name').text(customerName);
}
var customerId = GetQueryString('customerId');

// 数据结构化
var dataConvert = function (data) {
    var obj = {};
    var duebillIDMap = {};
    obj.pingji = diffPingji(data[0]);
    obj.shouxin = diffShouxin(data[1]);
    obj.tiaozheng = diffTiaozheng(data[2]);
    obj.X = diffX(data[4], duebillIDMap);
    obj.yongxin = diffYongxin(data[3], duebillIDMap);
    obj.Y = diffY(data[5]);
    var shouxin = obj.shouxin;
    var yongxin = obj.yongxin;
    var tiaozheng = obj.tiaozheng;
    var X = obj.X;
    var Y = obj.Y;
    if (!shouxin[0] || shouxin[0].empty) {
        shouxin = false;
        $('#nanjing2_url').addClass('disable');
    }
    if (!tiaozheng[0] || tiaozheng[0].empty) {
        tiaozheng = false;
        $('#nanjing3_url').addClass('disable');
    }
    if (!yongxin[0] || yongxin[0].empty) {
        yongxin = false;
        $('#nanjing4_url').addClass('disable');
    }
    if (!X[0] || X[0].empty) {
        X = false;
        $('#nanjingX_url').addClass('disable');
    }
    if (!Y[0] || Y[0].empty) {
        Y = false;
        $('#nanjingY_url').addClass('disable');
    }
    obj.customerID = '';
    if (obj.pingji[0] && !obj.customerID) {
        obj.customerID = obj.pingji[0].o_customerID;
    }
    if (obj.shouxin[0] && !obj.customerID) {
        obj.customerID = obj.shouxin[0].o_customerID;
    }
    if (obj.tiaozheng[0] && !obj.customerID) {
        obj.customerID = obj.tiaozheng[0].o_customerID;
    }
    if (obj.yongxin[0] && !obj.customerID) {
        obj.customerID = obj.yongxin[0].o_customerID;
    }
    obj.tree = {
        text: customerName,
        _id: '',
        children: [
            obj.pingji[0],
            {
                text: '授信与用信核对' + (Y ? '' : '(无数据)'),
                _id: 'nanjingY',
                children: Y
            },
            {
                text: '用信与放款核对' + (X ? '' : '(无数据)'),
                _id: 'nanjingX',
                children: X
            },
            {
                text: '授信' + (shouxin ? '(授信额度: ' + shouxin[0].totalMoney + ')' : '(无数据)'),
                _id: 'nanjing2',
                children: shouxin
            },
            {
                text: '授信调整' + (tiaozheng ? '(授信额度: ' + tiaozheng[0].totalMoney + ')' : '(无数据)'),
                _id: 'nanjing3',
                children: tiaozheng
            },
            {
                text: '用信' + (yongxin ? '(用信: ' + yongxin[0].totalMoney + ')' : '(无数据)'),
                _id: 'nanjing4',
                children: yongxin
            }
        ]
    }
    return obj;
};

// 差异对比 数据处理
var diffPingji = function (list) {
    if (typeof list === 'string' || list.length === 0) {
        list = [{empty: true}];
    }
    var obj = list[0];
    obj._id = 'nanjing1';
    obj.text = '评级';
    obj.title = '评级';
    if (obj.empty) {
        obj.text = '评级(无数据)';
        $('#nanjing1_url').addClass('disable');
    }
    obj.o_phaseOpinion = addColor([obj.nlp_evaluate], obj.o_phaseOpinion);
    obj.__customerName = customerName;
    return list;
};
var diffShouxin = function (list) {
    if (typeof list === 'string' || list.length === 0) {
        list = [{empty: true}];
    }
    var totalMoney = 0;
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        obj.json = {};
        obj._id = 'shouxin_' + i;
        obj.text = obj.o_businessTypeName || ('授信' + (i + 1));
        obj.title = '授信' + (i + 1) + '-' + (obj.o_businessTypeName || '');
        if (obj.o_lineEffFlag && obj.o_lineEffFlag == '2') {
            obj.text += '(有效)';
            obj.title += '(有效)';
        } else {
            obj.text += '(失效)';
            obj.title += '(失效)';
        }
        totalMoney += parseFloat(obj.nlp_bizSum) || 0;
        obj.o_term = getTerm(obj.o_termMonth, obj.o_termDay);
        obj.o_phaseOpinion = addColor([
            obj.nlp_vouchTypeName,
            obj.nlp_businessTypeCLName,
            obj.nlp_businessSum,
            obj.nlp_term
        ], obj.o_phaseOpinion);
        try {
            if (obj.nlp_guarantyEntity && obj.nlp_guarantyEntity !== 'Null') {
                obj.relation = getRelation(JSON.parse(obj.nlp_guarantyEntity));
            }
        } catch (e) {
        }
    }
    list[0].totalMoney = Math.round((totalMoney / 10000)) + '万元';
    return list;
};
var diffTiaozheng = function (list) {
    if (typeof list === 'string' || list.length === 0) {
        list = [{empty: true}];
    }
    var totalMoney = 0;
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        obj.json = {};
        obj._id = 'tiaozheng_' + i;
        obj.text = obj.o_businessTypeName || ('授信调整' + (i + 1));
        obj.title = '授信调整' + (i + 1) + '-' + (obj.o_businessTypeName || '');
        if (obj.o_lineEffFlag && obj.o_lineEffFlag == '2') {
            obj.text += '(有效)';
            obj.title += '(有效)';
        } else {
            obj.text += '(失效)';
            obj.title += '(失效)';
        }
        totalMoney += parseFloat(obj.nlp_bizSum) || 0;
        obj.o_term = getTerm(obj.o_termMonth, obj.o_termDay);
        obj.o_phaseOpinion = addColor([
            obj.nlp_vouchTypeName,
            obj.nlp_businessTypeCLName,
            obj.nlp_businessSum,
            obj.nlp_term
        ], obj.o_phaseOpinion);
        try {
            if (obj.nlp_guarantyEntity && obj.nlp_guarantyEntity !== 'Null') {
                obj.relation = getRelation(JSON.parse(obj.nlp_guarantyEntity));
            }
        } catch (e) {
        }
    }
    list[0].totalMoney = Math.round((totalMoney / 10000)) + '万元';
    return list;
};
var diffYongxin = function (list, duebillIDMap) {
    if (typeof list === 'string' || list.length === 0) {
        list = [{empty: true}];
    }
    var totalMoney = 0;
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        obj.json = {};
        obj._id = 'yongxin_' + i;
        obj.text = obj.o_businessTypeName || ('用信' + (i + 1));
        obj.title = '用信' + (i + 1) + '-' + (obj.o_businessTypeName || '');
        obj.o_term = getTerm(obj.o_termMonth, obj.o_termDay);
        totalMoney += parseFloat(obj.nlp_bizSum) || 0;
        obj.o_phaseOpinion = addColor([
            obj.nlp_vouchTypeName,
            obj.nlp_purpose,
            obj.nlp_businessTypeName,
            obj.nlp_businessSum,
            obj.nlp_businessCurrencyName,
            obj.nlp_term,
            obj.nlp_corpuspayMethodName,
            obj.nlp_payModeName,
            obj.nlp_businessRate,
            obj.nlp_rateFloat,
            obj.nlp_bailRatio,
            obj.nlp_bailSum,
            obj.nlp_pdgSum
        ], obj.o_phaseOpinion);
        obj.e_duebillID = duebillIDMap[obj.o_applyId] || '';
        // if (obj.o_businessType && obj.o_businessType[0]) {
        //     if (obj.o_businessType[0] == '1') {
        //         obj.o_bailRatio = '';
        //         obj.o_bailSum = '';
        //         obj.o_pdgSum = '';
        //     }
        //     if (obj.o_businessType[0] == '2') {
        //         obj.o_businessRate = '';
        //         obj.o_rateFloat = '';
        //     }
        // }
        try {
            if (obj.nlp_guarantyEntity && obj.nlp_guarantyEntity !== 'Null') {
                obj.relation = getRelation(JSON.parse(obj.nlp_guarantyEntity));
            }
        } catch (e) {
        }
    }
    list[0].totalMoney = Math.round((totalMoney / 10000)) + '万元';
    return list;
};

var diffX = function (list, duebillIDMap) {
    if (typeof list === 'string' || list.length === 0) {
        list = [{empty: true}];
    }
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        obj.json = {};
        obj._id = 'X_' + i;
        if (!obj.nlp_businessTypeName || obj.nlp_businessTypeName == 'Null') {
            obj.nlp_businessTypeName = '';
        }
        if (!obj.e_businessTypeName || obj.e_businessTypeName == 'Null') {
            obj.e_businessTypeName = '';
        }
        obj.phaseOpinion = addColor([
            obj.nlp_vouchTypeName,
            obj.nlp_purpose,
            obj.nlp_businessTypeName,
            obj.nlp_businessSum,
            obj.nlp_businessCurrencyName,
            obj.nlp_corpuspayMethodName,
            obj.nlp_payModeName,
            obj.nlp_businessRate,
            obj.nlp_rateFloat,
            obj.nlp_bailRatio,
            obj.nlp_pdgSum
        ], obj.phaseOpinion);
        // if (obj.o_businessType && obj.o_businessType[0]) {
        //     if (obj.o_businessType[0] == '1') {
        //         obj.BAILRATIO = '';
        //         obj.PDGSUM = '';
        //     }
        //     if (obj.o_businessType[0] == '2') {
        //         obj.BUSINESSRATE = '';
        //         obj.RATEFLOAT = '';
        //     }
        // }
        obj.nlp_businessTypeName = obj.nlp_businessTypeName.replace(/\&\&/g, ',');
        obj.text = obj.e_businessTypeName || ('用信与放款核对' + (i + 1));
        obj.title = '用信与放款核对' + (i + 1) + '-' + (obj.e_businessTypeName || '');
        duebillIDMap[obj.applyId] = obj.e_duebillID;
    }
    return list;
};

var diffY = function (list) {
    if (typeof list === 'string' || list.length === 0) {
        list = [{empty: true}];
    }
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        obj.json = {};
        obj._id = 'Y_' + i;
        if (!obj.b_nlp_businessTypeName || obj.b_nlp_businessTypeName == 'Null') {
            obj.b_nlp_businessTypeName = '';
        }
        obj.b_nlp_businessTypeName = obj.b_nlp_businessTypeName.replace(/\&\&/g, ',');
        if (!obj.c_nlp_businessTypeName || obj.c_nlp_businessTypeName == 'Null') {
            obj.c_nlp_businessTypeName = '';
        }
        obj.b_phaseOpinion = addColor([
            obj.b_nlp_vouchTypeName,
            obj.b_nlp_purpose,
            obj.b_nlp_businessTypeName,
            obj.b_nlp_businessSum
        ], obj.b_phaseOpinion);
        obj.c_phaseOpinion = addColor([
            obj.c_nlp_vouchTypeName,
            obj.c_nlp_purpose,
            obj.c_nlp_businessTypeName,
            obj.c_nlp_businessSum
        ], obj.c_phaseOpinion);
        obj.c_nlp_businessTypeName = obj.c_nlp_businessTypeName.replace('&&', ',');
        obj.text = obj.b_nlp_businessTypeName || ('授信与用信核对' + (i + 1));
        obj.title = '授信与用信核对' + (i + 1) + '-' + (obj.b_nlp_businessTypeName || '');
    }
    return list;
};

var getTerm = function (termMonth, termDay) {
    if (!termMonth && termMonth !== 0 && !termDay && termDay !== 0) {
        return '';
    }
    if (!termMonth && !termDay) {
        return '0个月';
    }
    return (termMonth ? (termMonth + '个月') : '') + (termDay ? (termDay + '天') : '');
}

// 染色
var addColor = function (list, text) {
    if (!text) {
        return text | '';
    }
    for (var i = 0; i < list.length; i++) {
        if (!list[i] && list[i] !== 0) {
            continue;
        }
        var str = list[i] + '';
        if (str.indexOf('&&') > -1) {
            text = addColor(str.split('&&'), text);
        } else {
            text = text.replace(str, '<span class="match-text">' + str + '</span>');
        }
    }
    return text;
}

var setCount = function () {
    $('.sub-card').each(function () {
        var $this = $(this);
        var differ = $this.find('.compare-td.differ').length;
        var correct = $this.find('.compare-td.correct').length;
        var id = $this.attr('id');
        $('#' + id + '-catalog').append('<span>(' + differ + '/' + (correct + differ) + ')</span>');
    });
};

var getRelation = function (obj) {
    var list = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var item = obj[key];
            for (var i = 0; i < item.length; i++) {
                var text = item[i] + '';
                var tr = {
                    key: key,
                    value: text.split('::')[0]
                };
                if (i == 0) {
                    tr.rowspan = item.length;
                }
                list.push(tr);
            }
        }
    }
    return list;
}

// 拉取数据
var loadData = function () {
    $('.detail-loading').show();
    util.ajax({
        url: '/api/nanjing/jiexi2',
        data: {
            customerName: customerName,
            customerId: customerId
        },
        cache: false,
        dataType: 'json',
        success: function (res) {
            $('.detail-loading').hide();
            if (res.status === 0) {
                var obj = dataConvert(res.data);
                renderAll(obj);
                setTimeout(function () {
                    fixPosition();
                    setCount();
                }, 0);
                if (obj.customerID) {
                    $('.empty-main').hide();
                    $('#nanjing > .card-wrap').show();
                    $('#pingji-customer-code').text('客户编号：' + obj.customerID);
                } else {
                    $('.empty-main').show();
                }
            } else {
                $('.empty-main').show();
            }
        },
        error: function (err) {
            $('.detail-loading').hide();
            $('.empty-main').show();
        }
    });
};

loadData();

var scrollBar = $('#main');

// 点击的滚动，不触发滚动事件
var stopScrollEvent = false;

// 初始滚动高度计算，最后数字补差，让页面好看
var top0 = 0;

// 滚动选中
function scrollSelect() {
    var contentDom = $('#main');
    var detailDom = $('#nanjing');
    var arr = detailDom.find('.card-wrap').toArray();
    for (var i = 0; i < arr.length; i++) {
        var $item = $(arr[i]);
        if ($item.position().top + top0 + $item.height() > contentDom.scrollTop()) {
            var type = $item.children('.card').attr('id');
            var active = $('.sub-tags-item.active');
            if (type !== active.attr('data-target')) {
                $('.sub-tags-item[data-target=' + type + ']').addClass('active');
                active.removeClass('active');
            }
            break;
        }
    }
}

// 点击滚动
function clickScroll(type, noAnimate) {
    var tag = $('#' + type + '_url');
    tag.siblings('.active').removeClass('active');
    tag.addClass('active');
    var targetDom = $('#' + type);
    if (!targetDom.length || targetDom.height() === 0) {
        return;
    }
    var top = targetDom.position().top + top0;
    var delay = 250;
    if (noAnimate) {
        delay = 0;
    }
    stopScrollEvent = true;
    scrollBar.animate({scrollTop: top}, delay, function () {
        stopScrollEvent = false;
    });
}

// 滚动头部变化
function scrollHeader() {
    var scrollTop = scrollBar.scrollTop();
    if (scrollTop <= 400) {
        $('#toTopBtn').fadeOut(500);
    }
    else {
        $('#toTopBtn').fadeIn(500);
    }

    if (scrollTop >= 85) {
        $('.sub-tags-wrap').addClass('shadow');
    } else {
        $('.sub-tags-wrap').removeClass('shadow');
    }
}

// 绑定滚动事件
scrollBar.scroll(function () {
    scrollHeader();
    !stopScrollEvent && scrollSelect();
});

var fixPosition = function () {
    var $nav = $('.nav');
    $nav.css('left', $('#nanjing').offset().left + 'px');
};

$(window).resize(function () {
    fixPosition();
});

// 点击二级标签,使得滚动条滚动到目标卡片
$(document).on('click', '.sub-tags-item', function () {
    var type = $(this).attr('data-target');
    clickScroll(type);
});

$('#tree').on('click', '.tree-expand', function () {
    var $el = $(this);
    var childrenDom = $el.parent().siblings('.tree-children');
    if (childrenDom.length) {
        if (childrenDom.is(':visible')) {
            childrenDom.slideUp(50);
            $el.addClass('icon-tree-show').removeClass('icon-tree-hide');
        }
        else {
            childrenDom.slideDown(50);
            $el.addClass('icon-tree-hide').removeClass('icon-tree-show');
        }
    }
});
$('#tree').on('click', '.tree-text', function () {
    $('#tree .tree-text.active').removeClass('active');
    var $this = $(this);
    $this.addClass('active');
    var id = $this.attr('data-id');
    var $card = $('#' + id);
    if ($card.length === 0 || $card.height() === 0) {
        return;
    }
    var top = $card.position().top + top0;
    stopScrollEvent = true;
    scrollBar.animate({scrollTop: top}, 250, function () {
        stopScrollEvent = false;
    });
});
$('#toTopBtn').on('click', function () {
    scrollBar.animate({scrollTop: 0}, 250);
    return false;
});