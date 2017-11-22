var express = require('express');
var router = new express.Router();
var db = require('../db');
var _ = require('lodash');
var json2csv = require('json2csv');

router.get('/uncleared', function (req, res, next) {
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