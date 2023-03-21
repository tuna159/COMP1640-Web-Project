import { Options } from 'highcharts';

export const barChartTKTSoTienTheoHS: Options = {
    chart: {
        type: 'bar',
        width: 1550
    },
    credits: {
        enabled: false,
    },
    title: {
        text: 'Thống kê số lượng tiền học đã đóng theo học sinh',
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
            text: 'Số tiền(Triệu đồng)',
            align: 'high',
            style: {
                overflow: 'justify',
            },

        }
    },
    xAxis: {
        categories: [
            '098989898989<br/>-Trần Đức Minh', 
            '098989898989<br/>-Trần Đức Minh', 
            '098989898989<br/>-Trần Đức Minh', 
            '098989898989<br/>-Trần Đức Minh', 
            '098989898989<br/>-Trần Đức Minh', 
            '098989898989<br/>-Trần Đức Minh', 
            '098989898989<br/>-Trần Đức Minh'],
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
        valueSuffix: ' triệu đồng'
    },
    series: [{
        name: 'Đã đóng',
        type: 'column',
        color: 'blue',
        data: [814, 841, 3714, 726, 31, 726, 31]
    }, {
        name: 'Còn nợ',
        type: 'column',
        color: '#FF530D',
        data: [800, 941, 1714, 226, 131, 426, 331]
    }]
};