import { Options } from 'highcharts/highstock';

export var chartTKChuyenCan: Options = {

  chart: {
    type: 'column',
    width: 1550
  },
  credits: {
    enabled: false,
  },

  title: {
    text: 'Thống kê chuyên cần của học sinh',
  },
  legend: {
    layout: 'vertical',
    verticalAlign: 'top',
    x: -40,
    y: 80,
    floating: true,
    borderWidth: 1,
    shadow: true,
  },
  yAxis: {
    title: {
      text: 'Số ngày',
      align: 'high',
    },
  },
  xAxis: {
    categories: [
      '6A',
      '6B',
      '6C',
      '6D',
      '6E',
      '6F',
      '6G',
      '6H',
      '6A',
      '6B',
      '6C',
      '6D',
      '6E',
      '6F',
      '6G',
    ],
    min:0,

    scrollbar: {
      enabled: true,
    },
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
    valueSuffix: ' học sinh',
  },
  series: [
    {
      name: 'Nghỉ học',
      type: 'column',
      color: 'green',
      data: [14, 41, 14, 26, 31, 26, 31, 14, 41, 14, 26, 31, 26, 31, 14],
    },
    {
      name: 'Đi học',
      type: 'column',
      color: 'black',
      data: [14, 41, 14, 26, 31, 26, 31, 14, 41, 14, 26, 31, 26, 31, 14],
    },
  ],

};
