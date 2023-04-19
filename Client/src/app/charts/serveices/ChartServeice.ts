import { Options } from 'highcharts';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class ChartServeice {

    constructor() { }

    
    createBarChartStaffEvent(x: string[], data1: number[],  data2: number[],) {
        let chartStaffEvent: Options = {
            chart: {
                type: 'column',
                width: 1100
            },
            credits: {
                enabled: false,
            },
            title: {
                text: ' ',
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 1500,
                    },
                }]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Staff',
                    align: 'high',
                    style: {
                        overflow: 'justify',
                    },
                }
            },
            xAxis: {
                categories: x,
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    }
                },
                series: {
                    borderRadius: 5,
                    pointWidth: 50
                } as any,
            },

            tooltip: {
                valueSuffix: ' staff'
            },
            series: [{
                name: 'Total staff',
                type: 'column',
                color: '#FF530D',
                data: data1
            }, {
                name: 'Staff contribute',
                type: 'column',
                color: 'blue',
                data: data2
            }]
        };
        return chartStaffEvent
    }

    createPieChartStaffContributeDepartment(dataContribute: any, dataNotContribute: any) {
        let PieChartStaffContribute: Options = {
            chart: {
                width: 1100,
                type: 'pie'
            },
            title: {
                text: ' ',
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
                name: 'percent',
                type: 'pie',
                data: [{
                    name: 'staff do not contribute',
                    color: 'red',
                    y: dataContribute,
                }, {
                    name: 'staff contributors',
                    color: 'blue',
                    y: dataNotContribute
                }]
            }]
        };
        return PieChartStaffContribute
    }

    createPieChartReactDepartment(dataLike: any, dataDislike: any) {
        let PieChartReactDepartment: Options = {
            chart: {
                width: 1100,
                type: 'pie'
            },
            title: {
                text: ' ',
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
                name: 'percent',
                type: 'pie',
                data: [{
                    name: 'Like',
                    y: dataLike,
                    color: 'blue'
                }, {
                    name: 'Dislike',
                    y: dataDislike,
                    color: 'red'

                }]
            }]
        };
        return PieChartReactDepartment
    }

    createLineCharIdeaDepartment(x: any, data: any) {
        let chartIdeaDepartment: Options = {
            chart: {
                type: 'line',
                width: 1100
            },
            credits: {
                enabled: false,
            },
            title: {
                text: ' ',
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 1500,
                    },
                }]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Staff',
                    align: 'high',
                    style: {
                        overflow: 'justify',
                    },

                }
            },
            xAxis: {
                type: 'datetime'
            },

            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    }
                },
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: Date.UTC(2023, 0, 1),
        		    pointIntervalUnit: 'month'
                }
            },

            tooltip: {
                valueSuffix: ' Idea'
            },
            series: data
        };
        return chartIdeaDepartment
    }

    createBarChartCommentDepartment(x: string[], data: number[]) {
        let chartCommentDepartment: Options = {
            chart: {
                type: 'column',
                width: 1100
            },
            credits: {
                enabled: false,
            },
            title: {
                text: ' ',
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 1500,
                    },
                    // chartOptions: {
                    //     yAxis: {
                    //         tickInterval: null
                    //     },
                    // }
                }]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Comment',
                    align: 'high',
                    style: {
                        overflow: 'justify',
                    },

                }
            },
            xAxis: {
                categories: x,
                // title: {
                //     text: 'Department',
                //     align: 'high',
                // },
            },

            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    }
                },
                series: {
                    borderRadius: 5,
                    pointWidth: 50
                } as any,
            },

            tooltip: {
                valueSuffix: ' comment'
            },
            series: [{
                // name: 'comment',
                type: 'column',
                color: 'blue',
                data: data
            }]
        };
        return chartCommentDepartment
    }
    
}