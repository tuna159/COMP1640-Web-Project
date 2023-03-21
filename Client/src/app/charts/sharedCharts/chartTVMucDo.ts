import { Options } from 'highcharts';

export const chartTVMucDo: Options = {
    chart: {
        type: 'column',
        width: 1550
    },
    credits: {
        enabled: false,
    },
    title: {
        text: 'Thống kê số lần xuống phòng y tế',
        align: 'center'
    },
    yAxis: {
        min: 0,
        title: {
        text: 'Số ngày xuống phòng y tế',
        align: 'high',
        style: {
            overflow: 'justify',
        },
        
        }
    },
    xAxis: {
        categories: ['Báo động', 'Nguy cơ cao', 'Nguy cơ', 'Tương đối an toàn'],
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
        name: 'số lượng người tham gia: ',
        type: 'column',
        color: 'blue',
        data: [14, 41, 14, 26]
    }]
};