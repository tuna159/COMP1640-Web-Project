import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { barChartTKTSoTienTheoHS } from './sharedCharts/barChartTKTSoTienTheoHS';
import { barChartTKTVCLB } from './sharedCharts/barChartTKTVCLB';
import { chartGioiTinh } from './sharedCharts/chartGioiTinh';
import { chartTKCaloriesTheoNgay } from './sharedCharts/chartTKCaloriesTheoNgay';
import { chartTKCaloriesTheoTuan } from './sharedCharts/chartTKCaloriesTheoTuan';
import { chartTKChuyenCan } from './sharedCharts/chartTKChuyenCan';
import { chartTKDanhHieu } from './sharedCharts/chartTKDanhHieu';
import { chartTKSoTienTheolop } from './sharedCharts/chartTKSoTienTheolop';
import { chartTKXuongYTe } from './sharedCharts/chartTKXuongYTe';
import { chartTVMucDo } from './sharedCharts/chartTVMucDo';
import { pieChartThamVan } from './sharedCharts/pieChartThamVan';
import { pieChartTyLeThamVan } from './sharedCharts/pieChartTyLeThamVan';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent {
  chonKhoiChuyenCan: any;
  chonKhoiKXuongYTe: any;
  chonKhoiDanhHieu: any;
  chonKhoiSoTien: any; 
  khois = [
    {name: 'Khối 6'},
    {name: 'Khối 7'},
    {name: 'Khối 8'},
    {name: 'Khối 9'},
    {name: 'Khối 10'},
    {name: 'Khối 11'},
    {name: 'Khối 12'},
];
  barChartTKTVCLB = new Chart(barChartTKTVCLB);
  chartGioiTinh = new Chart(chartGioiTinh);
  chartTKChuyenCan = new Chart(chartTKChuyenCan); 
  chartTKXuongYTe = new Chart(chartTKXuongYTe); 
  chartTKDanhHieu = new Chart(chartTKDanhHieu); 
  pieChartThamVan = new Chart(pieChartThamVan); 
  pieChartTyLeThamVan = new Chart(pieChartTyLeThamVan); 
  chartTVMucDo = new Chart(chartTVMucDo);
  chartTKSoTienTheolop = new Chart(chartTKSoTienTheolop);
  barChartTKTSoTienTheoHS = new Chart(barChartTKTSoTienTheoHS);
  chartTKCaloriesTheoTuan = new Chart(chartTKCaloriesTheoTuan)
  chartTKCaloriesTheoNgay = new Chart(chartTKCaloriesTheoNgay)
  
}
