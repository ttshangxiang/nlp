var express = require('express');
var router = new express.Router();
var nlp = require('./nlp');
var exportData = require('./export');

router.use('/nanjing', nlp);

router.use('/export', exportData);

module.exports = router;