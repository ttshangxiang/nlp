
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
    return nlp.replace(/\&\&/g, ',');
});

// 百分比
template.helper('percent', function (str) {
    if (str === 0) {
        str = '0';
    }
    str = str || '';
    str = str + '';
    str = str.replace('%', '');
    if (!str || str === 'Null') {
        return '';
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
template.helper('moneny', function (num, unity) {
    if (!num && num !== 0) {
        return '';
    }
    if (unity == '人民币') {
        unity = '元'
    }
    if (unity == '澳大利亚') {
        unity = '澳元';
    }
    return convertMoney(num) + (unity || '元');
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
    return nlp.replace(/\&\&/g, ',');
});

// 加元
template.helper('moneny2', function (num) {
    if (!num && num !== 0) {
        return '';
    }
    return num + '元';
});

// 判断是否
template.helper('shifou', function (num) {
    if (num == 1) {
        return '是';
    }
    if (num == 0) {
        return '否';
    }
    if (num == 2 || num == 3) {
        return '无解析数据';
    }
    return '';
});

// 阶段
template.helper('jieduan', function (num) {
    if (num == 'A') {
        return '评级';
    }
    if (num == 'B') {
        return '授信';
    }
    if (num == 'D') {
        return '授信调整';
    }
    if (num == 'F') {
        return '用信';
    }
    if (num == 'X') {
        return '用信vs放款';
    }
    if (num == 'Y') {
        return '授信vs用信';
    }
    return '';
});

// isNull
template.helper('isNull', function (num) {
    if (!num && num !== 0) {
        return '';
    }
    num = num + '';
    if (num.toUpperCase() === 'NULL') {
        return '';
    }
    return num;
});

// match
template.helper('match', function (type, str) {
    if (!type) {
        return true;
    }
    return str.indexOf(type) > 1;
});
