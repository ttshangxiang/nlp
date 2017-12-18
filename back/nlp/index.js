

var express = require('express');
var router = new express.Router();
var db = require('../db');
var _ = require('lodash');

// 解析数据
router.get('/jiexi', function (req, res, next) {
    getPingji(req.query.company).then(function (data) {
        var customerId = null;
        var customerName = req.query.company;
        if (data === 'error') {
            data = 'query database faild';
        } else if (data.length === 0) {
            data = 'not found';
        } else {
            customerId = data[0].customerID;
        }
        Promise.all([
            getShouxin(customerId, customerName),
            getShouxintiaozheng(customerId, customerName),
            getYongxin(customerId, customerName)
        ]).then(function (values) {
            values.unshift(data);
            res.status(200).send({status: 0, data: values});
        });
    });
});

// 汇率
router.get('/rate', function (req, res, next) {
    var selectSQL = 'select * from nlp_erate_info';
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send({status: 500, msg: 'query database faild'});
            return;
        }
        res.status(200).send({status: 0, data: data});
    });
});

// 根据主键筛选字段
function filterData (list, key) {
    return _.chain(list)
    .filter(function (o) {return o.nlpPhaseOpinion && o.nlpPhaseOpinion.indexOf('业务要素') > -1;})
    .orderBy([key, 'endTime'], ['asc', 'desc'])
    .uniqBy(key)
    .value();
}

// 根据主键筛选字段 - 评级
function filterData2 (list, key) {
    var arr = _.chain(list)
    .filter(function (o) {return !!o.nlpPhaseOpinion;})
    .value();
    var useArr = list;
    if (arr.length > 0) {
        useArr = arr;
    }
    return _.chain(useArr)
    .orderBy([key, 'endTime'], ['asc', 'desc'])
    .uniqBy(key)
    .value();
}

// 获取评级
function getPingji (company) {
    var p = new Promise(function (resolve, reject) {
        var selectSQL = 'select * from nlp_evaluate_info where customerName = "' + company + '"';
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('error');
                return;
            }
            resolve(filterData2(data, 'customerID'));
        });
    });
    return p;
}

// 获取授信
function getShouxin (customerId, customerName) {
    var where = ' customerName = "' + customerName + '"';
    if (customerId) {
        where = ' customerID ="' + customerId + '"';
    }
    var p = new Promise(function (resolve, reject) {
        var selectSQL = 'select * from nlp_cl_info where' + where;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(filterData(data, 'lineId'));
        });
    });
    return p;
}

// 获取授信调整
function getShouxintiaozheng (customerId, customerName) {
    var where = ' customerName = "' + customerName + '"';
    if (customerId) {
        where = ' customerID ="' + customerId + '"';
    }
    var p = new Promise(function (resolve, reject) {
        var selectSQL = 'select * from nlp_modify_cl_info where' + where;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(filterData(data, 'lineId'));
        });
    });
    return p;
}

// 获取用信
function getYongxin (customerId, customerName) {
    var where = ' customerName = "' + customerName + '"';
    if (customerId) {
        where = ' customerID ="' + customerId + '"';
    }
    var p = new Promise(function (resolve, reject) {
        var selectSQL = 'select * from nlp_approve_info where' + where;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(filterData(data, 'approveId'));
        });
    });
    return p;
}

// 获取统计数据
router.get('/attention', function (req, res, next) {
    var type = req.query.type;
    var selectSQL = 'select attentionSta as name, count as value from nlp_attention_count where identify="' + type + '" order by count desc';
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: data});
    });
});

// 获取统计数据
router.get('/attentionTop10', function (req, res, next) {
    var type = req.query.type;
    var selectSQL = 'select attentionSta as name, count as value from nlp_attention_count where identify="' + type + '" order by count desc limit 10';
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: data});
    });
});

// 获取统计数据
router.get('/class', function (req, res, next) {
    var type = req.query.type;
    var selectSQL = 'select classSta as name, count as value from nlp_class_count where identify="' + type + '" order by count desc';
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: data});
    });
});

// 获取未结清
router.get('/uncleared', function (req, res, next) {
    var customerName = req.query.customerName;
    var duebillID = req.query.duebillID;
    var contractId = req.query.contractId;
    var putoutID = req.query.putoutID;
    var businessType = req.query.businessType;
    var stemp = req.query.stemp;

    var offset = req.query.offset;
    var count = req.query.count;

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

    var limitStr = '';
    if (count) {
        limitStr += ' limit ' +  count;
    }
    if (offset) {
        limitStr += ' offset ' +  offset;
    }

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
            res.status(500).send('query database faild');
            return;
        }
        var querySQL = 'select * from nlp_uncleared_credit' + whereStr + limitStr;
        db.find(querySQL, function (data) {
            if (data === 'error') {
                res.status(500).send('query database faild');
                return;
            }
            res.status(200).send({
                status: 0,
                data: {
                    data: data,
                    total_count: total_count[0].total_count
                }
            });
        });
    });
});

// 获取集团
router.get('/group', function (req, res, next) {
    var groupName = req.query.groupName;
    var relativeId = req.query.relativeId;

    var offset = req.query.offset;
    var count = req.query.count;

    var whereArr = [];
    if (groupName) {
        whereArr.push('groupName like "%' + groupName + '%"');
    }
    if (relativeId) {
        whereArr.push('relativeId = "' + relativeId + '"');
    }

    var whereStr = ' where ';
    if (whereArr.length === 0) {
        whereStr = '';
    } else if (whereArr.length === 1) {
        whereStr += whereArr[0];
    } else if (whereArr.length > 1) {
        whereStr += whereArr.join(' and ');
    }

    var limitStr = '';
    if (count) {
        limitStr += ' limit ' +  count;
    }
    if (offset) {
        limitStr += ' offset ' +  offset;
    }

    // 查询总数
    var p = new Promise(function (resolve, reject) {
        var querySQL = 'select count(distinct relativeId) as total_count from nlp_grouprelative_info' + whereStr;
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
            res.status(500).send('query database faild');
            return;
        }
        var querySQL = 'select distinct relativeId, groupName from nlp_grouprelative_info' + whereStr + limitStr;
        db.find(querySQL, function (data) {
            if (data === 'error') {
                res.status(500).send('query database faild');
                return;
            }
            res.status(200).send({
                status: 0,
                data: {
                    data: data,
                    total_count: total_count[0].total_count
                }
            });
        });
    });
});

// 获取成员
router.get('/member', function (req, res, next) {
    var id = req.query.id;

    var quertSQL = 'select * from nlp_grouprelative_info where relativeId ="' + id + '"';
    db.find(quertSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({
            status: 0,
            data: data
        });
    });
});

// 获取用信 vs 授信
router.get('/yongXinVSShouXin', function (req, res, next) {
    var id = req.query.id;

    var selectSQL = `
        select sorgid, orgname, sum(unormal) as noStatistics, sum(normal) as yesStatistics from (
            select unormal, normal, case when orglevel = '6' then relativeorgid else operateOrgId end as sorgid from (
                select operateOrgId, sum(value0) unormal, sum(value1) normal from (
                    select lineid, operateOrgId, sum(case when a.approveSum > b.lineSum then 1 else 0 end) as value0,
                    sum(case when a.approveSum <= b.lineSum then 1 else 0 end) as value1 from (
                        select lineid, oprateOrgId, sum(nlp_bizSum) as approveSum from nlp_unstrured_info
                        where nlp_identify = 'F' and approveId is not null group by lineid, operateOrgId
                    ) a,
                    (
                        select lineid as lineApproveId, operateOrgId as orgid, sum(nlp_bizSum) as lineSum from nlp_unstrured_info
                        where nlp_identify in ('B', 'D') and approveId is not null group by lineid, operateOrgId
                    ) b where b.lineApproveId = a.lineid group by lineid, operateOrgId
                ) c group by operateOrgId
            ) d, nlp_org_info e where e.orglevel in ('2','3','6') and orgid <> '11' and d.operateOrgId = e.orgid
        ) f, nlp_org_info g where sorgid = g.orgid group by sorgid, orgname`;
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: _.orderBy(data, 'noStatistics', 'desc')});
    });
});
router.get('/yongXinVSShouXinSub', function (req, res, next) {
    var orgId = req.query.orgId
    var selectSQL = `
        select orgid, orgname, sum(unormal) as noStatistics, sum(normal) as yesStatistics from (
            select operateOrgId, sum(value0) unormal, sum(value1) normal from (
                select lineid, operateOrgId, sum(case when a.approveSum > b.lineSum then 1 else 0 end) as value0,
                sum(case when a.approveSum <= b.lineSum then 1 else 0 end) as value1 from (
                    select lineid, operateOrgId, sum(nlp_bizSum) as approveSum from nlp_unstrured_info
                    where nlp_identify = 'F' and approveId is not null group by lineid, operateOrgId
                ) a,
                (
                    select lineid as lineApproveId, operateOrgId as orgid, sum(nlp_bizSum) as lineSum from nlp_unstrured_info
                    where nlp_identify in ('B', 'D') and approveId is not null group by lineid, operateOrgId
                ) b where b.lineApproveId = a.lineid group by lineid, operateOrgId
            ) c group by operateOrgId
        ) d, nlp_org_info e where e.orglevel in ('2', '3', '6') and orgid <> '11' and d.operateOrgId = e.orgid 
        and e.relativeorgid = '${orgId}' group by orgid, orgname`;
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: _.orderBy(data, 'noStatistics', 'desc')});
    });
});

// 获取用信 vs 放款
router.get('/yongXinVSFangKuan', function (req, res, next) {
    var selectSQL = `
        select sorgid, orgname, sum(unormal) as noStatistics, sum(normal) as yesStatistics from (
            select unormal, normal, case when orglevel = '6' then relativeorgid else operateOrgId end as sorgid from (
                select operateOrgId, sum(value0) unormal, sum(value1) normal from (
                    select contractId, operateOrgId, sum(case when a.approveSum < b.balance then 1 else 0 end) as value0,
                    sum(case when a.approveSum >= b.balance then 1 else 0 end) as value1 from (
                        select contractId, operateOrgId, sum(nlp_bizSum) as approveSum from nlp_unstrured_info
                        where nlp_identify = 'F' and approveId is not null group by contractId, operateOrgId
                    ) a,
                    (
                        select contractId as contractDueId, sum(balance) as balance from nlp_uncleared_credit
                        where contractId is not NULL group by contractId
                    ) b where b.contractDueId = a.contractId group by contractId, operateOrgId
                ) c group by operateOrgId
            ) d, nlp_org_info e where e.orglevel in ('2', '3', '6') and orgid <> '11' and d.operateOrgId = e.orgid
        ) f, nlp_org_info g where sorgid = g.orgid group by sorgid, orgname ORDER BY sorgid`;
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: _.orderBy(data, 'noStatistics', 'desc')});
    });
});
router.get('/yongXinVSFangKuanSub', function (req, res, next) {
    var orgId = req.query.orgId
    var selectSQL = `
        select orgid, orgname, sum(unormal) as noStatistics, sum(normal) as yearStatistics from (
            select operateOrgId, sum(value0) unormal, sum(value1) normal from (
                select contractId, operateOrgId, sum(case when a.approveSum < b.balance then 1 else 0 end) as value0,
                sum(case when a.approveSum >= b.balance then 1 else 0 end) as value1 from (
                    select contractId, operateOrgId, sum(nlp_bizSum) as approveSum from nlp_unstrured_info
                    where nlp_identify = 'F' and approveId is not null group by contractId, operateOrgId
                ) a,
                (
                    select contractId as contractDueId, sum(balance) as balance from nlp_uncleared_credit
                    where contractId is not NULL group by contractId
                ) b where b.contractDueId = a.contractId group by contractId, operateOrgId
            ) c group by operateOrgId
        ) d, nlp_org_info e where e.orglevel in ('2', '3', '6') and orgid <> '11' and d.operateOrgId = e.orgid
        and e.relativeorgid = '${orgId}' group by orgid, orgname`;
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        res.status(200).send({status: 0, data: _.orderBy(data, 'noStatistics', 'desc')});
    });
});


// 后台解析版本
router.get('/jiexi2', function (req, res, next) {
    var customerId = req.query.customerId;
    var customerName = req.query.customerName;
    Promise.all([
        getPingji2(customerId, customerName),
        getShouxin2(customerId, customerName),
        getShouxintiaozheng2(customerId, customerName),
        getYongxin2(customerId, customerName),
        getX(customerId, customerName),
        getY(customerId, customerName)
    ]).then(function (data) {
        res.status(200).send({status: 0, data: data});
    });
});

// 获取新版评级
function getPingji2 (customerId, customerName) {
    var where = ' a.customerName = "' + customerName + '"';
    if (customerId) {
        where = ' a.customerID ="' + customerId + '"';
    }
    var p = new Promise(function (resolve, reject) {
        var selectSQL =
        `select c.customerName as o_customerName, c.evaluateResult as o_evaluateResult, c.cognResult as o_cognResult, c.customerID as o_customerID,
        c.nlpPhaseOpinion as o_nlpPhaseOpinion, c.phaseOpinion as o_phaseOpinion, a.*, b.* from nlp_evaluate_info c
        LEFT JOIN nlp_check_elements_info b ON c.customerID = b.customerID
        LEFT JOIN nlp_unstrured_info a ON c.customerID = a.customerID
        WHERE ${where} order by c.endTime`;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }

            var arr = _.chain(data)
            .filter(function (o) {
                return _.includes(o.o_nlpPhaseOpinion, '客户评级');
            })
            .value();

            var first = arr[0] || data[0];
            if (first) {
                resolve([first]);
            } else {
                resolve([]);
            }
        });
    });
    return p;
}

// 获取新版授信
function getShouxin2 (customerId, customerName) {
    var where = ' a.customerName = "' + customerName + '"';
    if (customerId) {
        where = ' a.customerID ="' + customerId + '"';
    }
    where += ' and a.nlp_identify = "B"';
    var p = new Promise(function (resolve, reject) {
        var selectSQL =
        `select c.lineId as o_lineId, c.approveId as o_approveId, c.clTypeName as o_clTypeName, c.businessTypeName as o_businessTypeName,
        c.lineSum as o_lineSum, c.vouchTypeName as o_vouchTypeName, c.customerID as o_customerID, c.termMonth as o_termMonth, c.termDay as o_termDay,
        a.nlp_phaseOpinion as o_nlpPhaseOpinion, a.phaseOpinion as o_phaseOpinion, a.lineEffFlag as o_lineEffFlag,
        a.applyId as o_applyId, a.*, b.* from nlp_unstrured_info a
        LEFT JOIN nlp_check_elements_info b ON a.lineId = b.lineId
        LEFT JOIN nlp_cl_info c ON a.lineId = c.lineId
        WHERE ${where}`;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(_.uniqBy(data, 'o_lineId'));
        });
    });
    return p;
}

// 获取新版授信调整
function getShouxintiaozheng2 (customerId, customerName) {
    var where = ' a.customerName = "' + customerName + '"';
    if (customerId) {
        where = ' a.customerID ="' + customerId + '"';
    }
    where += ' and a.nlp_identify = "D"';
    var p = new Promise(function (resolve, reject) {
        var selectSQL =
        `select c.lineId as o_lineId, c.approveId as o_approveId, c.clTypeName as o_clTypeName, c.businessTypeName as o_businessTypeName,
        c.lineSum as o_lineSum, c.termMonth as o_termMonth, c.vouchTypeName as o_vouchTypeName, c.customerID as o_customerID,
        a.nlp_phaseOpinion as o_nlpPhaseOpinion, a.phaseOpinion as o_phaseOpinion, a.lineEffFlag as o_lineEffFlag,
        a.appyId as o_applyId, a.*, b.* from nlp_unstrured_info a
        LEFT JOIN nlp_check_elements_info b ON a.lineId = b.lineId
        LEFT JOIN nlp_modify_cl_info c ON a.lineId = c.lineId
        WHERE ${where}`;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(_.uniqBy(data, 'o_lineId'));
        });
    });
    return p;
}

// 获取新版用信
function getYongxin2 (customerId, customerName) {
    var where = ' a.customerName = "' + customerName + '"';
    if (customerId) {
        where = ' a.customerID ="' + customerId + '"';
    }
    where += ' and a.nlp_identify = "F"';
    var p = new Promise(function (resolve, reject) {
        var selectSQL =
        `select c.approveId as o_approveId, c.pLineID as o_pLineID, c.contractId as o_contractId,c.businessTypeName as o_businessTypeName,
        c.businessSum as o_businessSum, c.businessCurrencyName as o_businessCurrencyName, c.termDay as o_termDay, c.termMonth as o_termMonth, 
        c.corpuspayMethodName as o_corpuspayMethodName, c.payModeName as o_payModeName, c.businessRate as o_businessRate, c.rateFloat as o_rateFloat,
        c.bailRatio as o_bailRatio, c.bailSum as o_bailSum, c.pdgSum as o_pdgSum, c.vouchTypeName as o_vouchTypeName, c.purpose as o_purpose,
        a.nlp_phaseOpinion as o_nlpPhaseOpinion, a.phaseOpinion as o_phaseOpinion, c.customerID as o_customerID, c.businessType as o_businessType,
        a.appyId as o_applyId, a.*, b.* from nlp_unstrured_info a
        LEFT JOIN nlp_check_elements_info b ON a.approveId = b.approveId
        LEFT JOIN nlp_approve_info c ON a.approveId = c.approveId
        WHERE ${where}`;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(_.uniqBy(data, 'o_approveId'));
        });
    });
    return p;
}

// 获取业务品种
router.get('/businessType', function (req, res, next) {
    var selectSQL = 'select distinct businessType, businessTypeName from nlp_uncleared_credit';
    db.find(selectSQL, function (data) {
        if (data === 'error') {
            res.status(500).send({status: 500, msg: 'query database faild'});
            return;
        }
        res.status(200).send({status: 0, data: data});
    });
});

// 获取用信vs放款
function getX (customerId, customerName) {
    var where = ' a.customerName = "' + customerName + '"';
    if (customerId) {
        where = ' a.customerID ="' + customerId + '"';
    }
    where += ' and a.nlp_identify = "X"';
    var p = new Promise(function (resolve, reject) {
        var selectSQL =
        `select (select itemName from nlp_code_library where codeno = 'PayMode' and itemno = c.paymode) as l_paymode,
        (select itemName from nlp_code_library where codeno = 'CorpusPayMethod' and itemno = c.corpuspaymethod) as l_corpuspaymethod
        a.*, b.*, c.* from nlp_check_elements_info a,
        (select * from nlp_unstrured_info where nlp_identify = 'F') b,
        (select d.*, f.approveId, e.duebillID as e_duebillID, e.businessTypeName as e_businessTypeName, 
        e.vouchTypeName as e_vouchTypeName, e.businessSum as e_businessSum, e.businessCurrencyName as e_businessCurrencyName
        from nlp_biz_putout d, nlp_uncleared_credit e, nlp_unstrured_info f
        where d.serialno = e.putoutID and e.contractId = f.contractId and f.nlp_identify = 'F') c
        WHERE a.approveId = b.approveId and a.approveId = c.approveId and ${where}`;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(data);
        });
    });
    return p;
}

// 获取用信vs授信
function getY (customerId, customerName) {
    var where = ' a.customerName = "' + customerName + '"';
    if (customerId) {
        where = ' a.customerID ="' + customerId + '"';
    }
    where += ' and a.nlp_identify = "Y"';
    var p = new Promise(function (resolve, reject) {
        var selectSQL =
        `select c.lineId as c_lineId, c.nlp_businessTypeName as c_nlp_businessTypeName, c.phaseOpinion as c_phaseOpinion, c.nlp_businessSum as c_nlp_businessSum,
        c.nlp_vouchTypeName as c_nlp_vouchTypeName, c.nlp_purpose as c_nlp_purpose, c.nlp_PhaseOpinion as c_nlp_PhaseOpinion, c.nlp_identify as c_nlp_identify,
        b.approveId as b_approveId, b.nlp_businessTypeName as b_nlp_businessTypeName, b.phaseOpinion as b_phaseOpinion, b.nlp_businessSum as b_nlp_businessSum,
        b.nlp_vouchTypeName as b_nlp_vouchTypeName, b.nlp_purpose as b_nlp_purpose, b.nlp_PhaseOpinion as b_nlp_PhaseOpinion,
        c.nlp_rateFloat as c_nlp_rateFloat, b.nlp_rateFloat as b_nlp_rateFloat,
        a.* from nlp_check_elements_info a,
        (select * from nlp_unstrured_info where nlp_identify = 'F') b,
        (select * from nlp_unstrured_info where nlp_identify in ('B', 'D')) c 
        WHERE a.lineId = b.lineId and a.lineId = c.lineId and ${where}`;
        db.find(selectSQL, function (data) {
            if (data === 'error') {
                resolve('query database faild');
                return;
            }
            resolve(data);
        });
    });
    return p;
}

// 核对结果导出
router.get('/check_result', function (req, res, next) {

    var offset = req.query.offset;
    var count = req.query.count;

    var limitStr = '';
    if (count) {
        limitStr += ' limit ' + count;
    }
    if (offset) {
        limitStr += ' offset ' + offset;
    }

    var identify = req.query.identify;
    
    var where = '';
    if (identify) {
        where += 'and nlp_identify = "' + identify + '"';
    }

    // 查询总数
    var p = new Promise(function (resolve, reject) {
        var querySQL = `
            select count(*) as total_count from (
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
                resolve('error');
                return;
            }
            resolve(data);
        });
    });

    p.then(function (total_count) {
        if (total_count === 'error') {
            res.status(500).send('query database faild');
            return;
        }
        var querySQL = `
            select * from (
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
            ) b where yNoflag = 0 ${where}
            order by nlp_identify ${limitStr}`;
        db.find(querySQL, function (data) {
            if (data === 'error') {
                res.status(500).send('query database faild');
                return;
            }
            res.status(200).send({
                status: 0,
                data: {
                    data: data,
                    total_count: total_count[0].total_count
                }
            });
        });
    });
})

module.exports = router;