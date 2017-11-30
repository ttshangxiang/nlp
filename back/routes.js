var express = require('express');
var router = new express.Router();
var nlp = require('./nlp');
var exportData = require('./export');
var clear = require('./auth').clear;

router.use('/nanjing', nlp);

router.use('/export', exportData);

router.get('/logout', function (req, res, next) {
    var token = req.cookies.nlp_access_token;
    if (!token) {
        res.send({status: 0, msg: '未登录'});
    } else {
        clear(token);
        res.send({status: 0, msg: 'OK'});
    }
})

module.exports = router;