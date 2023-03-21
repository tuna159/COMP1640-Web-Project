import { Options } from 'highcharts/highstock';

export var chartTKCaloriesTheoNgay: Options = {

    chart: {
        type: 'bar',
        width: 1550
    },
    credits: {
        enabled: false,
    },

    title: {
        text: 'Thống kê calories theo ngày trong tháng',
    },
    yAxis: {
        title: {
            text: 'Calories',
            align: 'high',
        },
    },
    xAxis: {
        categories: [
            'thứ 2',
            'thứ 2',
            'thứ 2',
            'thứ 2',
            'thứ 2',
        ],
        min: 0,

        scrollbar: {
            enabled: true,
        },
    },

    plotOptions: {
        column: {
            dataLabels: {
                enabled: false
            }
        },
        series: {
            borderRadius: 5,
        } as any,
    },

    tooltip: {
        valueSuffix: ' calories',
    },
    series: [
        {
            name: 'Calories',
            type: 'column',
            color: 'green',
            data: [14, 41, 14, 26, 31, 26],
        },

    ],

};
