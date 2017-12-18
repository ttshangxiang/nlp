
var $ = require('jquery');
var echarts = require('echarts');
var util = require('../public/util');

var loading = '<div class="icon-loading-static-icon detail-loading"><span>加载中...</span></div>';
var showError = function (str) {
    return '' +
    '<div class="empty-main">' +
        '<div class="wrapper">' +
            '<div class="no-company-data icon-no-data-face"></div>' +
            '<p class="main-tips">' + (str || '加载失败') + '</p>' +
        '</div>' +
    '</div>';
};

var loadFail = showError();

var renderPies = function (id, data) {
    var newDom = util.resetChart(id);
    setTimeout(function () {
        var myChart = echarts.init(newDom[0]);
        var option = {
            title : {
                text: '累计放款金额超用信金额不良占比',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['一致','不一致']
            },
            series : [
                {
                    name: '数量',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data: data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart.setOption(option);
    }, 0);
};

var renderCharts2 = function (id, data, title, addEvent) {
    var newDom = util.resetChart(id);
    setTimeout(function () {
        var myChart = echarts.init(newDom[0]);
        var option = {
            title: {
                text: title || '各机构累计放款金额超用信金额笔数',
                x:'center'
            },
            color: ['#3398DB'],
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                containLabel: true
            },
            xAxis : [{
                type : 'category',
                data : data.name,
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            }],
            yAxis : [{
                type : 'value'
            }],
            dataZoom: [{
                type: 'slider',
                show: true,
                startValue: 0,
                endValue: 14
            }, {
                type: 'inside',
                startValue: 0,
                endValue: 14
            }],
            series : [{
                name:'数量',
                type: 'bar',
                barWidth: '60%',
                data: data.value
            }]
        };
        
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        addEvent && addEvent(myChart);
    }, 0);
};

var pieConvert = function (list) {
    var obj = [{
        name: '一致', value: 0
    }, {
        name: '不一致', value: 0
    }];
    for (var i = 0; i < list.length; i++) {
        obj[0].value += list[i].yesStatistics;
        obj[1].value += list[i].noStatistics;
    }
    return obj;
};

var lineConvert = function (list) {
    var obj = {
        name: [], value: []
    }
    for (var i = 0; i < list.length; i++) {
        obj.value.push({
            sorgid: list[i].sorgid,
            value: list[i].noStatistics
        });
        obj.name.push(list[i].orgname);
    }
    return obj;
};

var getData2 = function (suc, err) {
    $('#chart7').html(loading);
    $('#chart7-back').hide();
    util.ajax({
        url: '/api/nanjing/yongXinVSFangKuan',
        cache: false,
        dataType: 'json',
        success: function (res) {
            suc && suc(res);
            if (res.status === 0) {
                $('#chart7').html('');
                renderCharts2('chart7', lineConvert(res.data), '', addEvent);
            } else {
                $('#chart7').html(loadFail);
            }
        },
        error: function () {
            err && err();
            $('#chart7').html(loadFail);
        }
    });
};

var getData3 = function (params) {
    $('#chart7').html(loading);
    $('#chart7-back').show();
    util.ajax({
        url: '/api/nanjing/yongXinVSFangKuanSub?orgId=' + params.data.sorgid,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.status === 0) {
                $('#chart7').html('');
                renderCharts2('chart7', lineConvert(res.data), params.name);
            } else {
                $('#chart7').html(loadFail);
            }
        },
        error: function () {
            $('#chart7').html(loadFail);
        }
    });
};

var addEvent = function (chart) {
    chart.on('click', function (params) {
        getData3(params);
    });
};

var count3Init = function () {
    $('#chart6').html(loading);
    getData2(function (res) {
        if (res.status === 0) {
            $('#chart6').html('');
            renderPies('chart6', pieConvert(res.data));
        } else {
            $('#chart6').html(loadFail);
        }
    }, function () {
        $('#chart6').html(loadFail);
    });
};

module.exports = count3Init;

$(function () {
    $('#chart7-back').click(function () {
        getData2();
    });
});

