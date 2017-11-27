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
        whereArr.push('customerName like "%' + customerName + '%"');
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

    
    var fields = ['customerName', 'duebillID', 'contractId', 'putoutID', 'businessTypeName', 'businessCurrencyName', 'businessSum', 'balance', 'interestbalance1', 'interestbalance2', 'operateOrgName'];
    var fieldNames = ['客户名称', '借据流水号', '合同号', '出帐号', '业务品种', '币种', '借据金额', '余额', '表内欠息', '表外欠息', '经办机构'];
    
    // 查询总数
    var p = new Promise(function (resolve, reject) {
        var querySQL = 'select count(*) as total_count from nlp_uncleared_credit' + whereStr;
        db.find(querySQL, function (data) {
            if (data === 'error') {
                resolve('error');
                return;
            }
            resolve(data);
        });
    });


    p.then(function (total_count) {
        if (total_count === 'error') {
            res.status(500).send('查询数据库失败');
            return;
        }
        var querySQL = `select concat("'", a.duebillID) as _duebillID,
            concat("'", a.contractId) as _contractId,
            concat("'", a.putoutID) as _putoutID, a.* from nlp_uncleared_credit a` + whereStr;
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
});

router.get('/group', function (req, res, next) {
    var fields = ['car', 'price', 'color'];
    var fieldNames = ['卡车', '价格', '颜色'];
    var myCars = [{
        "car": "Audi",
        "price": 40000,
        "color": "blue"
    }, {
        "car": "BMW",
        "price": 35000,
        "color": "black"
    }, {
        "car": "Porsche",
        "price": 60000,
        "color": "green"
    }];
    var csv = json2csv({
        data: myCars,
        fields: fields,
        fieldNames: fieldNames
    });

    var fileName = encodeURIComponent('嘻嘻哈哈.csv');

    // 设置 header 使浏览器下载文件
    res.setHeader('Content-Description', 'File Transfer');
    res.setHeader('Content-Type', 'application/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    res.setHeader('Expires', '0');
    res.setHeader('Cache-Control', 'must-revalidate');

    // 为了让 Windows 能识别 utf-8，加上了 dom
    res.send('\uFEFF' + csv);
});

module.exports = router;