import { map } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ChartServeice } from './serveices/ChartServeice';
import { MessageService } from 'primeng/api';
import { Options } from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent {

  apiUrlStaffDepartment: string = "http://localhost:3009/api/event/";
  xStaffDepartment: any;
  dataStaffDepartment: any;
  
  events = [];
  eventValue: any;

  staffs = [];
  staffValue: any;

  departments = [];
  departmentValue: any;

    // chart Thống kê staff of department by event
    barChartStaffDepartment = null;
    optionsBarChartStaffDepartment: Options = null;

    // pie chart Thống kê staff contribute
    pieChartStaffContribute = null;
    optionsPieChartStaffContribute: Options = null;

    // pie chart Thống kê react department
    pieChartReactDepartment = null;
    optionsPieChartReactDepartment: Options = null;

    // line chart Thống kê react department
    lineCharIdeaDepartment = null;
    optionsLineCharIdeaDepartment: Options = null;

    

  constructor(
    private chartsService: ChartServeice,
    private messageService: MessageService,private http: HttpClient, 
    private authService: AuthenticationService, private router: Router) {
    this.getEvent()
    

    // pie chart Thống kê staff contribute
    this.optionsPieChartStaffContribute = chartsService.createPieChartStaffContributeDepartment(this.xStaffDepartment, this.dataStaffDepartment);
    this.pieChartStaffContribute = new Chart(this.optionsPieChartStaffContribute);

    // pie chart Thống kê react department
    this.optionsPieChartReactDepartment = chartsService.createPieChartReactDepartment(this.xStaffDepartment, this.dataStaffDepartment);
    this.pieChartReactDepartment = new Chart(this.optionsPieChartReactDepartment);

    // line chart Thống kê react department
    this.optionsLineCharIdeaDepartment = chartsService.createLineCharIdeaDepartment(3, this.dataStaffDepartment);
    this.lineCharIdeaDepartment = new Chart(this.optionsLineCharIdeaDepartment);
  }

  getEvent() {
    this.http.get<any>(this.apiUrlStaffDepartment + 7 + '/dashboard/staff-contribution', {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      if (result.status_code != 200) {
        this.showMessage('error', result.error_message);
        return;
      }
      // chart Thống kê staff of department by event
          this.optionsBarChartStaffDepartment = this.chartsService.createBarChartStaffDepartment(result.data.map(x =>x.total_staff), result.data.map(x =>x.staff_contributed));
          this.barChartStaffDepartment = new Chart(this.optionsBarChartStaffDepartment);
      })
  }

  changeEvent() {

  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }
}
