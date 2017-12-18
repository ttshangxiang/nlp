var express = require('express');
var router = new express.Router();
var db = require('../db');
var _ = require('lodash');
var json2csv = require('json2csv');

router.get('/uncleared', function (req, res, next) {
    var customerName = req.query.customerName;
    var duebillID = req.query.duebillID;
    var contractId = req.query.contractId;
    var putoutID = req.query.putoutID;
    var businessType = req.query.businessType;

    var whereArr = [];
    if (customerName) {
        whereArr.push('(customerName like "%' + customerName + '%" or customerID = "' + customerName + '")');
    }
    if (duebillID) {
        whereArr.push('duebillID = "' + duebillID + '"');
    }
    if (contractId) {
        whereArr.push('contractId = "' + contractId + '"');
    }
    if (putoutID) {
        whereArr.push('putoutID = "' + putoutID + '"');
    }
    if (businessType) {
        whereArr.push('businessType = "' + businessType + '"');
    }

    var whereStr = ' where ';
    if (whereArr.length === 0) {
        whereStr = '';
    } else if (whereArr.length === 1) {
        whereStr += whereArr[0];
    } else if (whereArr.length > 1) {
        whereStr += whereArr.join(' and ');
    }

    var fields = ['customerName', '_customerID', '_duebillID', '_contractId', '_putoutID', 'businessTypeName', 'businessCurrencyName', 'businessSum', 'balance', 'interestbalance1', 'interestbalance2', 'operateOrgName'];
    var fieldNames = ['客户名称', '客户编号', '借据流水号', '合同号', '出帐号', '业务品种', '币种', '借据金额', '余额', '表内欠息', '表外欠息', '经办机构'];

    var querySQL = `select concat("'", a.duebillID) as _duebillID,
        concat("'", a.contractId) as _contractId,
        concat("'", a.putoutID) as _putoutID,
        concat("'", a.customerID) as _customerID, a.* from nlp_uncleared_credit a` + whereStr;


    db.find(querySQL, function (data) {
        if (data === 'error') {
            res.status(500).send('查询数据库失败');
            return;
        }
        var csv = json2csv({
            data: data,
            fields: fields,
            fieldNames: fieldNames
        });
    
        var fileName = encodeURIComponent('未结清授信业务情况.csv');
    
        // 设置 header 使浏览器下载文件
        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Type', 'application/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
        res.setHeader('Expires', '0');
        res.setHeader('Cache-Control', 'must-revalidate');
    
        // 为了让 Windows 能识别 utf-8，加上了 dom
        res.send('\uFEFF' + csv);
    });

});

var dataFormat = function (data, fields) {
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.nlp_identify == 'B') {
            item.nlp_identify = '授信';
        } else if (item.nlp_identify == 'D') {
            item.nlp_identify = '授信调整';
        } else if (item.nlp_identify == 'F') {
            item.nlp_identify = '用信';
        } else if (item.nlp_identify == 'X') {
            item.nlp_identify = '用信vs放款';
        } else if (item.nlp_identify == 'Y') {
            item.nlp_identify = '授信vs用信';
        }
        for (var j = 0; j < fields.length; j++) {
            var key = fields[j];
            if (key.indexOf('nlp_compare') > 1) {
                if (item[key] == 1) {
                    item[key] = '是';
                } else if (item[key] == 0) {
                    item[key] = '否';
                } else if (item[key] == 2 || item[key] == 3) {
                    item[key] = '无解析数据';
                } else {
                    item[key] = '';
                }
            }
        }
    }
    return data;
}

router.get('/check_result', function (req, res, next) {

    var commonFields = [
        'nlp_identify',
        'customerName',
        '_customerID',
        '_lineId',
        '_contractId',
        '_approveId'
    ];
    var commonFeildNames = ['阶段', '客户名称', '客户编号', '额度编号', '合同编号', '用信编号'];
    var fields = [
        'nlp_compare_evaluate',
        'nlp_compare_bizType',
        'nlp_compare_bizTypeCL',
        'nlp_compare_bizSum',
        'nlp_compare_term',
        'nlp_compare_bizRate',
        'nlp_compare_rateFloat',
        // 'nlp_compare_rateModify',
        'nlp_compare_corpMet',
        'nlp_compare_payMode',
        'nlp_compare_purpose',
        'nlp_compare_pdgSum',
        // 'nlp_compare_benefitCorp',
        // 'nlp_compare_gathering',
        // 'nlp_compare_lcType',
        // 'nlp_compare_contractMax',
        // 'nlp_compare_keyItems',
        'nlp_compare_bailSum',
        'nlp_compare_bailRatio',
        'nlp_compare_vouchType',
        'nlp_compare_bizCurrency'
    ];
    var fieldNames = [
        '评级结果是否一致',
        '业务品种/业务名称是否一致',
        '额度类型是否一致',
        '金额是否一致',
        '期限是否一致',
        '执行年利率是否一致',
        '利率浮动是否一致',
        // '利率调整方式是否一致',
        '还款方式是否一致',
        '支付方式是否一致',
        '用途是否一致',
        '手续费是否一致',
        // '受益人是否一致',
        // '收款人是否一致',
        // '信用证类型是否一致',
        // '最高额合同是否一致',
        // '重点事项是否一致',
        '保证金是否一致',
        '保证金比例是否一致',
        '主要担保方式是否一致',
        '币种是否一致'
    ];

    var identify = req.query.identify;

    if (identify == 'A') {
        fields = commonFields.concat('nlp_compare_evaluate');
        fieldNames = commonFeildNames.concat('评级结果是否一致');
    } else if (identify == 'B' || identify == 'D') {
        fields = commonFields.concat([
            'nlp_compare_bizTypeCL',
            'nlp_compare_bizSum',
            'nlp_compare_term',
            'nlp_compare_vouchType'
        ]);
        fieldNames = commonFeildNames.concat([
            '额度类型是否一致',
            '金额是否一致',
            '期限是否一致',
            '主要担保方式是否一致'
        ]);
    } else if (identify == 'F') {
        fields = commonFeildNames.concat([
            'nlp_compare_bizType',
            'nlp_compare_bizSum',
            'nlp_compare_term',
            'nlp_compare_bizRate',
            'nlp_compare_rateFloat',
            'nlp_compare_corpMet',
            'nlp_compare_payMode',
            'nlp_compare_purpose',
            'nlp_compare_pgdSum',
            'nlp_compare_bailSum',
            'nlp_compare_bailRatio',
            'nlp_compare_vouchType',
            'nlp_compare_bizCurrency'
        ]);
        fieldNames = commonFeildNames.concat([
            '业务品种/业务名称是否一致',
            '金额是否一致',
            '期限是否一致',
            '执行年利率是否一致',
            '利率浮动是否一致',
            '还款方式是否一致',
            '支付方式是否一致',
            '用途是否一致',
            '手续费是否一致',
            '保证金是否一致',
            '保证金比例是否一致',
            '主要担保方式是否一致',
            '币种是否一致'
        ]);
    } else if (identify == 'X') {
        fields = commonFeildNames.concat([
            'nlp_compare_bizType',
            'nlp_compare_bizSum',
            'nlp_compare_bizRate',
            'nlp_compare_rateFloat',
            'nlp_compare_corpMet',
            'nlp_compare_payMode',
            'nlp_compare_purpose',
            'nlp_compare_pgdSum',
            'nlp_compare_bailSum',
            'nlp_compare_bailRatio',
            'nlp_compare_vouchType',
            'nlp_compare_bizCurrency'
        ]);
        fieldNames = commonFeildNames.concat([
            '业务品种/业务名称是否一致',
            '金额是否一致',
            '执行年利率是否一致',
            '利率浮动是否一致',
            '还款方式是否一致',
            '支付方式是否一致',
            '用途是否一致',
            '手续费是否一致',
            '保证金是否一致',
            '保证金比例是否一致',
            '主要担保方式是否一致',
            '币种是否一致'
        ]);
    } else if (identify == 'Y') {
        fields = commonFeildNames.concat([
            'nlp_compare_bizType',
            'nlp_compare_bizSum',
            'nlp_compare_purpose',
            'nlp_compare_vouchType'
        ]);
        fieldNames = commonFeildNames.concat([
            '业务品种/业务名称是否一致',
            '金额是否一致',
            '用途是否一致',
            '主要担保方式是否一致'
        ]);
    }

    var where = '';
    if (identify) {
        where += 'and nlp_identify = "' + identify + '"';
    }

    var querySQL = `select
        concat("'", b.customerID) as _customerID,
        concat("'", b.lineId) as _lineId,
        concat("'", b.contractId) as _contractId,
        concat("'", b.approveId) as _approveId, b.* from (
            select case when
            nlp_compare_evaluate = 0     -- 评级结果是否一致',
            or nlp_compare_bizType = 0      -- 业务品种/业务名称是否一致
            or nlp_compare_bizTypeCL = 0    -- 额度类型是否一致
            or nlp_compare_bizSum = 0       -- 金额是否一致
            or nlp_compare_term = 0         -- 期限是否一致
            or nlp_compare_bizRate = 0      -- 执行年利率是否一致
            or nlp_compare_rateFloat = 0    -- 利率浮动是否一致
            or nlp_compare_rateMondify = 0  -- 利率调整方式是否一致
            or nlp_compare_corpMet = 0      -- 还款方式是否一致
            or nlp_compare_payMode = 0      -- 支付方式是否一致
            or nlp_compare_purpose = 0      -- 用途是否一致
            or nlp_compare_pdgSum = 0       -- 手续费是否一致
            or nlp_compare_benefitCorp = 0  -- 受益人是否一致
            or nlp_compare_gathering = 0    -- 收款人是否一致
            or nlp_compare_lcType = 0       -- 信用证类型是否一致
            or nlp_compare_contractMax = 0  -- 最高额合同是否一致
            or nlp_compare_keyItems = 0     -- 重点事项是否一致
            or nlp_compare_bailSum = 0      -- 保证金是否一致
            or nlp_compare_bailRatio = 0    -- 保证金比例是否一致
            or nlp_compare_vouchType = 0    -- 主要担保方式是否一致
            or nlp_compare_bizCurrency = 0  -- 币种是否一致
            then 0 else 1 end as yNoflag, a.*
            from nlp_check_elements_info a
        ) b where yNoflag = 0 ${where}`;
    db.find(querySQL, function (data) {
        if (data === 'error') {
            res.status(500).send('查询数据库失败');
            return;
        }
        var csv = json2csv({
            data: data,
            fields: fields,
            fieldNames: fieldNames
        });
        
        var fileName = '核对结果列表.csv';
        if (identify == 'A') {
            fileName = '评级-' + fileName;
        } else if (identify == 'B') {
            fileName = '授信-' + fileName;
        } else if (identify == 'D') {
            fileName = '授信调整-' + fileName;
        } else if (identify == 'F') {
            fileName = '用信-' + fileName;
        } else if (identify == 'X') {
            fileName = '用信vs放款-' + fileName;
        } else if (identify == 'Y') {
            fileName = '授信vs用信-' + fileName;
        }
        var fileName = encodeURIComponent(fileName);
        
        // 设置 header 使浏览器下载文件
        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Type', 'application/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
        res.setHeader('Expires', '0');
        res.setHeader('Cache-Control', 'must-revalidate');
    
        // 为了让 Windows 能识别 utf-8，加上了 dom
        res.send('\uFEFF' + csv);
    });
});

module.exports = router;