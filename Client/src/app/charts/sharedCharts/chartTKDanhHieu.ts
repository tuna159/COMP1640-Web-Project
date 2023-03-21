import { Options } from 'highcharts';

export const chartTKDanhHieu: Options = {
    chart: {
        type: 'column',
        width: 1550
    },
    credits: {
        enabled: false,
    },
    title: {
        text: 'Thống kê học sinh theo danh hiệu',
    },
    yAxis: {
        min: 0,
        title: {
        text: 'Số học sinh',
        align: 'high',
        style: {
            overflow: 'justify',
        },
        
        }
    },
    xAxis: {
        categories: ['6A', '6B', '6C', '6D', '6E', '6F', '6G', '6H'],
    },

    plotOptions: {
        column: {
            dataLabels: {
                enabled: true
            }
        },
        series: {
            borderRadius: 5,
        } as any,
    },

    tooltip: {
        valueSuffix: ' học sinh'
    },
    series: [{
        name: 'số học sinh',
        type: 'column',
        color: 'green',
        data: [814, 841, 3714, 726, 31, 726, 31]
    }]
};