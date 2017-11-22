/**
 * @file 前端过滤器
 * @author Jamter on 16/9/23
 */

// var moment = window.moment;
// var template = window.template;

moment.locale('zh-cn');
// var template = require("../../scripts/lib/template.js");
template.config('escape', false);
template.helper('isObject', function (data) {
    function isObject(data) {
        if ((typeof data === 'object') && data != null) {
            return true;
        }
        return false;
    }
    return isObject(data);

});
/**
 * @desc 1.将格式为'yyyy-MM-dd 00:00:00'截取为'yyyy-MM-dd';
 *       2.将'yyyy-M-d'转化为'yyyy-MM-dd';
 *       3.3.将'yyyy-MM-dd'原样输出;
 *
 * */
template.helper('spliceDate', function (value) {
    if (value !== '' && typeof value === 'string' && new Date(value) != 'Invalid Date') {
        var array = value.split(' ');
        var dateNums = array[0].split('-');
        var formatDate = dateNums[0] + '';
        for (var i = 1, l = dateNums.length; i < l; i++) {
            formatDate += '-';
            if (Number(dateNums[i]) < 10 && dateNums[i].charAt(0) !== '0') {
                formatDate += '0';
            }
            formatDate += dateNums[i];
        }
        // 如果时分秒部分,不是'00:00:00',则保留
        if (array[1] && array[1] !== '00:00:00' && array[1] !== '00:00') {
            formatDate += ' ' + array[1];
        }
        return formatDate;
    }
    return '--';
});
template.helper('filterNullToLine', function (str) {
    if (typeof (str) === 'undefined') {
        return '--';
    }
    else if (str === '') {
        return '--';
    }
    return str;
});
template.helper('encodeURIComponent', function (str) {
    return encodeURIComponent(str);
});
template.helper('filterNullToZero', function (str) {
    if (typeof (str) === 'undefined') {
        return 0;
    }
    else if (str === '') {
        return 0;
    }
    return str;
});
template.helper('getYesNoEmpty', function (value) {
    if (value === undefined) {
        return '--';
    }
    if (value === true) {
        return '是';
    }
    return '否';
});

template.helper('getShareholderType', function (value) {
    if (!value) {
        return '--';
    }
    if (value.indexOf('Person') > -1) {
        return '自然人股东';
    }
    if (value.indexOf('Company') > -1) {
        return '法人股东';
    }
    return '--';
});

/**
 * @desc 将形如'注销（注销日期1993年5月11日）'的字串替换为'注销',即去掉括号及其内容
 *
 * */
template.helper('formatCompanyStatus', function (value) {
    if (value !== null && value !== undefined) {
        var reg = /\（.*\）/g;
        var newValue = value.replace(reg, '');
        return newValue;
    }
});

/**
 * @desc 数组连接
 *
 * */
template.helper('arrJoinWithComma', function (arr) {
    if (arr instanceof Array && arr.length > 0) {
        return arr.join(',');
    }
    return '--';
});

/**
 * @desc 将'1850000000.00'格式的数据转化为'185,000.00'(转化为万元、千分位格式、保存两位小数)
 *
 * */
template.helper('formatMoney', function (value) {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
        return;
    }
    // 将数字进行千分位格式化
    function toThousands(num) {
        num = (num || 0).toString();
        var parts = num.split('.');
        var bigZeroPart = parts[0];
        var result = '';
        while (bigZeroPart.length > 3) {
            result = ',' + bigZeroPart.slice(-3) + result;
            bigZeroPart = bigZeroPart.slice(0, bigZeroPart.length - 3);
        }
        if (bigZeroPart) {
            result = bigZeroPart + result;
        }
        if (parts.length > 1) {
            result += '.' + parts[1].toString();
        }
        return result;
    }

    value = (value / 10000).toFixed(2);
    value = toThousands(value);
    return value;
});

// 千分位+万元转换 同步ejs_filter
template.helper('captital_format', function (num, unit) {
    unit = unit || '';
    function format(num) {
        return (num.toFixed(2) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
    }
    if (parseFloat(num) === 0) {
        return '未公布';
    }
    if (isNaN(num)) {
        return '--';
    }
    if (num) {
        if (num < 10000) {
            return format(parseFloat(num)) + unit;
        }
        return format(num / 10000) + ' 万' + unit;
    }
    return '--';
});

/**
 *@desc 通过一个企业的状态来判断该企业是否有风险
 *
 * */
template.helper('isRiskComStatus', function (value) {
    if (value === null || value === undefined) {
        return;
    }

	// 拥有以下状态的企业,均认为有风险:
	// 注销、内资注销、外资注销、吊销，未注销、吊销，已注销、吊销,已注销、注销企业、注吊销、吊销已注销、吊销后注销
	// 吊销企业、吊销、已吊销、内资吊销、外资吊销、被吊销、吊销、吊销,未注销、吊销未注销
	// 迁出、迁移异地、迁往外省市、迁移、已迁出企业、已迁出
	// 清算、清算中
	// 停业
	// 撤销登记
    if ('注销;吊销;迁出;迁往;迁移;清算;停业;撤销登记'.indexOf(value) !== -1) {
        return true;
    }
    return false;
});

/**
 *@desc 毫秒时间转换格式
 *
 * */
template.helper('dateFormat', function (datetime) {
    if (datetime) {
        return moment(datetime, 'x').format('YYYY-MM-DD HH:mm:ss');
    }
    return '--';
});

/**
 *@desc 时间戳转日期
 *
 * */
template.helper('timestampToDate', function (datetime) {
    if (datetime) {
        return moment(datetime, 'x').format('YYYY-MM-DD');
    }
    return '--';
});

/**
 * @desc 导出时间
 */
template.helper('timeOption', function (value) {
    if (value === 0) {
        return '按照数据抓取时间';
    }
    if (value === 1) {
        return '按照内容更新时间';
    }
    return '--';
});
/**
 * @desc
 */
template.helper('join_with_comma', function (arr) {
    arr = arr || [];
    if (arr.length > 0) {
        return arr.join(',');
    }
    return '';
});
/**
 * @desc
 * 根据stock_code返回中文
 *创业板
 *创业板的代码是300打头的股票代码
 *
 *沪市A股
 *沪市A股的代码是以600、601或603打头
 *
 *沪市B股
 *沪市B股的代码是以900打头
 *
 *深市A股
 *深市A股的代码是以000、001打头
 *
 *中小板
 *中小板的代码是002打头
 *
 *深市B股
 *深圳B股的代码是以200打头
 */
template.helper('stock_code_filter', function (str) {
    var arr = str.split(',');
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        var code = arr[i];
        if (/^300/.test(code)) {
            result.push('创业板');
        }
        else if (/^60[013]/.test(code)) {
            result.push('沪市A股');
        }
        else if (/^900/.test(code)) {
            result.push('沪市B股');
        }
        else if (/^00[01]/.test(code)) {
            result.push('深市A股');
        }
        else if (/^002/.test(code)) {
            result.push('中小板');
        }
        else if (/^200/.test(code)) {
            result.push('深市B股');
        }
    }
    return result.join(',');
});

// 格式化百分号为小数点后两位
template.helper('format_percent_num', function (value) {
    if (!value) {
        return '--';
    }
    value = parseFloat(value);
    if (isNaN(value)) {
        return '--';
    }
    return value.toFixed(2) + '%';
});

/**
 * @desc 将'1850000000.00'格式的数据转化为'185,000.00 万'
 *
 * */
template.helper('format_money_3', function (value) {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
        return '';
    }
    value = value.toString();
    var start = value.indexOf('(');
    if (start === -1) {
        start = value.indexOf('(');
    }
    var unit = value.substring(start);
    // var chart = unit.substring(0, 1);
    unit = ' 万';
    value = (parseFloat(value) * 100) / (10000 * 100);
    value = value.toFixed(2) + '' + unit;
    return value;
});

// JSON.stringify
template.helper('toJSON', function (value) {
    return JSON.stringify(value);
});

// 百分比大于百分之五十
template.helper('gt50percent', function (value) {
    var num = parseFloat(value);
    if (isNaN(num)) {
        return false;
    }
    return num >= 50;
});

// 两个参数拼接，中间加-
template.helper('joinLine', function (str, str2) {
    if (!str && !str2) {
        return '--';
    }
    if (str && !str2) {
        return str;
    }
    if (!str && str2) {
        return str2;
    }
    return str + '-' + str2;
});

// 消息详情时间获取
template.helper('formatVals', function (key, val) {
    var dateArr = ['publish_time', 'publish_date', 'filing_date', 'case_date', 'reg_date', 'court_time'];
    if (dateArr.indexOf(key) > -1) {
        return val.split(' ')[0];
    }
    if (Object.prototype.toString.call(val) === '[object Array]') {
        return val.join();
    }
    return val;
});

// 绝对路径
template.helper('absolutePath', function (path) {
    if (path[0] !== '/') {
        path = '/' + path;
    }
    return path;
});
// 替换换行符、空格
template.helper('formatText', function (str) {
    str = str.replace(/\r/g, '&nbsp;');
    str = str.replace(/\t/g, '&nbsp;&nbsp;');
    str = str.replace(/\n/g, '<br />');
    return str;
});
// 分割
template.helper('split', function (str) {
    return str.split(' ');
});

template.helper('datetimeToDate', function (datetime) {
    if (typeof (datetime) === 'undefined') {
        return '';
    }
    return datetime.split(' ')[0];
});

// 算年龄
template.helper('yearOld', function (str) {
    var num = parseInt(str, 0);
    if (isNaN(num)) {
        return '--';
    }
    return new Date().getFullYear() - num;
});

// 处理舆情信息中，作者里面包含时间
template.helper('authorAndTime', function (author, time) {
    var arr = author.match(/\d{4}.{1}\d{2}.{1}\d{2}.*/);
    if (arr && arr[0]) {
        author = author.replace(arr[0], '').replace(/\s/g, '');
        if (!time) {
            time = arr[0].replace(/[年月]/g, '-').replace(/日/g, '');
        }
    }
    if (!time) {
        time = '';
    }
    return author + '    ' + time;
});

// 获取身份是原告还是被告
template.helper('identity', function (company, plaintiffList, defendantList) {
    if (plaintiffList && plaintiffList.join
        && plaintiffList.join(',').indexOf(company) > -1) {
        return '原告';
    }
    if (defendantList && defendantList.join
        && defendantList.join(',').indexOf(company) > -1) {
        return '被告';
    }
    return '--';
});

// 如果列表里面文字长度大于3，添加链接
template.helper('insertLink', function (arr, detailIndex) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace(/\s/g, '');
        if (arr[i].length > 3 && arr[i].indexOf('公司') > -1) {
            var uri = '/detail/' + detailIndex + '?name=' + encodeURIComponent(arr[i]);
            arr[i] = '<a href="' + uri + '" class="click-color" target="_blank">' + arr[i] + '</a>';
        }
    }
    if (arr instanceof Array && arr.length > 0) {
        return arr.join('，');
    }
    return '--';
});

// indexOf
template.helper('indexOf', function (str, query) {
    return str.indexOf(query);
});
// 判断是不是空对象
template.helper('ObjectNull', function (object) {
    return Object.keys(object).length
});

// 不分大小写判断
template.helper('equalsIgnoreCase', function (str1, str2) {     
    if(str1.toUpperCase() === str2.toUpperCase()) {     
        return true;     
    }     
    return false;     
});

// 转码成json
template.helper('parseJson', function (str) {
    var obj;
    try {
        obj = JSON.parse(str);
    } catch (error) {
        obj = {};
    }
    return obj;
});

// 解析数据
template.helper('nlpData', function (nlp) {
    var defaultStr = '无解析数据';
    if (!nlp) {
        return defaultStr;
    }
    if (typeof nlp === 'string') {
        return nlp || defaultStr;
    }
    if (!nlp.length || nlp.length === 0) {
        return defaultStr;
    }
    if (nlp.length === 1) {
        return nlp[0];
    }
    var str = '';
    for (var i = 0; i < nlp.length; i++) {
        if (nlp[i]) {
            str += nlp[i] + ',';
        }
    }
    return str.substr(0, str.length - 1);
});

// 解析数据
template.helper('nlpData2', function (nlp) {
    var defaultStr = '无解析数据';
    if (!nlp || nlp === 'Null') {
        return defaultStr;
    }
    return nlp;
});
