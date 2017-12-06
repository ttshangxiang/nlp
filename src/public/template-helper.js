
var template = require('../lib/template');

// 解析数据
template.helper('nlpData2', function (nlp) {
    if (nlp === 0) {
        nlp = '0';
    }
    nlp = nlp || '';
    nlp = nlp + '';
    var defaultStr = '<span style="color:#bbb;">无解析数据</span>';
    if (!nlp || nlp === 'Null') {
        return defaultStr;
    }
    return nlp.replace('&&', ',');
});

// 百分比
template.helper('percent', function (str) {
    str = str || '';
    str = str + '';
    str = str.replace('%', '');
    if (!str && str !== '0') {
        return str + '%';
    }
    if (isNaN(str)) {
        return str;
    }
    return str + '%';
});

// 转义
template.helper('encodeURIComponent', function (str) {
    return encodeURIComponent(str);
});

var convertMoney = function (num) {
    var num = parseFloat(num);
    if (isNaN(num)) {
        return '0.00';
    }
    var str = num.toFixed(2);
    for (var i = str.length - 6; i > 0; i -= 3) {
        str = str.substr(0, i) + ',' + str.substr(i);
    }
    return str;
}

// 金钱格式化
template.helper('moneny', function (num) {
    if (!num && num !== 0) {
        return '';
    }
    return convertMoney(num) + '元';
});

// 无提取数据
template.helper('nlpData3', function (nlp) {
    if (nlp === 0) {
        nlp = '0';
    }
    nlp = nlp || '';
    nlp = nlp + '';
    var defaultStr = '<span style="color:#bbb;">无提取数据<span>';
    if (!nlp || nlp === 'Null') {
        return defaultStr;
    }
    return nlp.replace('&&', ',');
});

// 金钱格式化
template.helper('moneny2', function (num) {
    if (!num && num !== 0) {
        return '';
    }
    return num + '元';
});
