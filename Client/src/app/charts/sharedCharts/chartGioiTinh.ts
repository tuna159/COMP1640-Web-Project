import { Options } from 'highcharts';

export const chartGioiTinh: Options = {
    chart: {
        type: 'column',
        width: 1550
    },
    credits: {
        enabled: false,
    },
    title: {
        text: 'Tỷ lệ học sinh theo giới tính',
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        shadow: true
    },
    yAxis: {
        min: 0,
        title: {
        text: 'Số lượng học sinh',
        align: 'high',
        style: {
            overflow: 'justify',
        },
        
        }
    },
    xAxis: {
        categories: ['Khối 6', 'Khối 7', 'Khối 8', 'Khối 9', 'Khối 10', 'Khối 11', 'Khối 12'],
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
        name: 'Nam',
        type: 'column',
        color: '#FF530D',
        data: [814, 841, 3714, 726, 31, 726, 31]
    }, {
        name: 'Nữ',
        type: 'column',
        color: 'blue',
        data: [800, 941, 1714, 226, 131, 426, 331]
    }]
};