import { Options } from 'highcharts';

export const barChartTKTVCLB: Options = {
    chart: {
        type: 'bar',
        width: 1550
    },
    credits: {
        enabled: false,
    },
    title: {
        text: 'Thống kê số lượng thành viên tham gia câu lạc bộ',
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
    legend: {
        enabled: false,
    },
    xAxis: {
        lineColor: '#fff',
        categories: [
            'Bóng đá',
            'Bóng rổ',
            'Cầu lông',
            'Bóng chuyền',
            'Bóng bàn',
            'Tiếng Đức',
            'Tiếng Nhật',
            'Tiếng Hàn',
            'Thiên văn học',
            'Robotic',
            'Lập trình tư duy',
            'Ghi-ta',
            'Mỹ thuật',
        ],
    },
    tooltip: {
        valueSuffix: ' học sinh'
    },
    plotOptions: {
        series: {
            borderRadius: 5,
        } as any,
    },

    series: [
        {
            type: 'column',
            color: 'green',
            name: 'số học sinh',
            data: [
                { y: 20.9 },
                { y: 71.5 },
                { y: 106.4 },
                { y: 129.2 },
                { y: 144.0 },
                { y: 176.0 },
                { y: 135.6 },
                { y: 148.5 },
                { y: 216.4 },
                { y: 194.1 },
                { y: 95.6 },
                { y: 54.4 },
            ],
        },
    ],
};