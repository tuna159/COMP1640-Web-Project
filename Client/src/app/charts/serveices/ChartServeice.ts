import { Options } from 'highcharts';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class ChartServeice {

    constructor() { }

    
    createBarChartStaffDepartment(x: string[], data: number[]) {
        let chartStaffDepartment: Options = {
            chart: {
                type: 'column',
                width: 1500
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
                    text: 'Staff',
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
                valueSuffix: ' staff'
            },
            series: [{
                name: 'staff',
                type: 'column',
                color: 'blue',
                data: data
            }]
        };
        return chartStaffDepartment
    }

    createPieChartStaffContributeDepartment(dataContribute: any, dataNotContribute: any) {
        let PieChartStaffContribute: Options = {
            chart: {
                width: 1500,
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
                name: 'Tỷ lệ',
                type: 'pie',
                data: [{
                    name: 'staff do not contribute',
                    y: dataContribute,
                }, {
                    name: 'staff contributors',
                    y: dataNotContribute
                }]
            }]
        };
        return PieChartStaffContribute
    }

    createPieChartReactDepartment(dataLike: any, dataDislike: any) {
        let PieChartReactDepartment: Options = {
            chart: {
                width: 1500,
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
                name: 'Tỷ lệ',
                type: 'pie',
                data: [{
                    name: 'Like',
                    y: dataLike,
                }, {
                    name: 'Dislike',
                    y: dataDislike
                }]
            }]
        };
        return PieChartReactDepartment
    }

    createLineCharIdeaDepartment(x: number, data: any) {
        let chartIdeaDepartment: Options = {
            chart: {
                type: 'line',
                width: 1500
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
                    text: 'Staff',
                    align: 'high',
                    style: {
                        overflow: 'justify',
                    },

                }
            },
            xAxis: {
                type: 'datetime',
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
                    pointStart: Date.UTC(x, 0, 1),
        		    pointIntervalUnit: 'month'
                }
            },

            tooltip: {
                valueSuffix: ' staff'
            },
            series: [{
                name: 'staff',
                type: 'column',
                color: 'blue',
                data: data
                // [{
                //     name: 'Installation & Developers',
                //     data: [43934, 48656, 65165, 81827, 112143, 142383,
                //         171533, 165174, 155157, 161454, 154610]
                // }, {
                //     name: 'Manufacturing',
                //     data: [24916, 37941, 29742, 29851, 32490, 30282,
                //         38121, 36885, 33726, 34243, 31050]
                // }, {
                //     name: 'Sales & Distribution',
                //     data: [11744, 30000, 16005, 19771, 20185, 24377,
                //         32147, 30912, 29243, 29213, 25663]
                // }, {
                //     name: 'Operations & Maintenance',
                //     data: [null, null, null, null, null, null, null,
                //         null, 11164, 11218, 10077]
                // }, {
                //     name: 'Other',
                //     data: [21908, 5548, 8105, 11248, 8989, 11816, 18274,
                //         17300, 13053, 11906, 10073]
                // }],
            }]
        };
        return chartIdeaDepartment
    }
    
}