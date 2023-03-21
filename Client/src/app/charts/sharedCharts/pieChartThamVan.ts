import { Options } from 'highcharts';

export const pieChartThamVan: Options = {
    chart: {
        width: 705,
        type: 'pie'
    },
    title: {
        text: 'Tỷ lệ trường hợp tham vấn',
        align: 'left'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
            }
        }
    },
    series: [{
        name: 'Tỷ lệ',
        type: 'pie',
        data: [{
            name: 'Học sinh',
            y: 70,
        }, {
            name: 'Giáo viên',
            y: 30
        }]
    }]
};