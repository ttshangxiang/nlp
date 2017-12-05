    
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

var chart1, chart2, chart3;

var dataCovert = function (data) {
    var obj = {name: [], value: []};
    for (var i = 0; i < data.length; i++) {
        obj.name.push(data[i].name);
        obj.value.push(data[i].value);
    }
    return obj;
};

var renderCharts = function (id, data) {
    var myChart = echarts.init(document.getElementById(id));
    var option = {
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
        series : [{
            name:'数量',
            type: 'bar',
            barWidth: '60%',
            data: data.value
        }]
    };
    
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    return myChart;
};

var renderCharts2 = function (id, data) {
    var myChart = echarts.init(document.getElementById(id));
    var option = {
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
            start: 0,
            end: 50,
            handleSize: 8
        }, {
            type: 'inside',
            start: 0,
            end: 50
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
    return myChart;
};

var renderWordCloud = function (data) {
    var chart = echarts.init(document.getElementById('chart3'));
    var option = {
        tooltip: {},
        series: [ {
            type: 'wordCloud',
            gridSize: 4,
            sizeRange: [12, 60],
            rotationRange: [-90, 90],
            rotationStep: 90,
            shape: 'circle',
            width: '95%',
            height: '95%',
            drawOutOfBound: true,
            textStyle: {
                normal: {
                    color: function () {
                        return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                    }
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: data
        } ]
    };
    chart.setOption(option);
    return chart;
};

var getAttentionTop10 = function (type) {
    $('#chart1').html(loading);
    util.ajax({
        url: '/api/nanjing/attentionTop10?type=' + type,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.status === 0) {
                chart1 && chart1.dispose();
                chart1 = renderCharts('chart1', dataCovert(res.data));
            } else {
                $('#chart1').html(loadFail);
            }
        },
        error: function () {
            $('#chart1').html(loadFail);
        }
    });
};

var getAttention = function (type) {
    $('#chart3').html(loading);
    util.ajax({
        url: '/api/nanjing/attention?type=' + type,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.status === 0) {
                try {
                    chart3 && chart3.dispose();
                    chart3 = renderWordCloud(res.data.slice(0, 150));
                } catch (error) {
                    $('#chart3').html(showError('浏览器可能不支持'));
                }
            } else {
                $('#chart3').html(loadFail);
            }
        },
        error: function () {
            $('#chart3').html(loadFail);
        }
    });
};

var getClass = function (type) {
    $('#chart2').html(loading);
    util.ajax({
        url: '/api/nanjing/class?type=' + type,
        cache: false,
        dataType: 'json',
        success: function (res) {
            if (res.status === 0) {
                chart2 && chart2.dispose();
                chart2 = renderCharts2('chart2', dataCovert(res.data));
            } else {
                $('#chart2').html(loadFail);
            }
        },
        error: function () {
            $('#chart2').html(loadFail);
        }
    });
};

var countInit = function () {
    // 初始化
    $('.step-box').each(function (index, item) {
        $(item).find('.step:eq(0)').click();
    });
};

module.exports = countInit;

$(function () {
    
    $('.step').click(function () {
        var $this = $(this);
        if ($this.hasClass('active')) {
            return;
        }
        $this.addClass('active').siblings('.active').removeClass('active');
        var datafor = $this.parent().attr('data-for');
        var type = $this.attr('data-value');
        if (datafor === 'chart1') {
            getAttentionTop10(type);
        }
        if (datafor === 'chart2') {
            getClass(type);
        }
        if (datafor === 'chart3') {
            getAttention(type);
        }
    });
});