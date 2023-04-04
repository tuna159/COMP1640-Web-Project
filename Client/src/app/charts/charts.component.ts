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

    apiUrl: string = "http://localhost:3009/api/event";
    xStaffDepartment: any;
    dataStaffDepartment: any;
    events = [];
    eventValue: any;

    staffs = [];
    staffValue: any;

    departments = [];
    departmentValue: any;

  constructor(
    private chartsService: ChartServeice,
    private messageService: MessageService,private http: HttpClient, 
    private authService: AuthenticationService, private router: Router) {
    this.getEvent()
    // chart Thống kê staff of department by event
    this.optionsBarChartStaffDepartment = chartsService.createBarChartStaffDepartment(this.xStaffDepartment, this.dataStaffDepartment);
    this.barChartStaffDepartment = new Chart(this.optionsBarChartStaffDepartment);

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

  async getEvent() {
    this.http.get<any>(this.apiUrl, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      if (result.status_code != 200) {
        this.showMessage('error', result.error_message);
        return;
      }
      result.data.forEach(item => {
        let bodyData = {
          id: item.event_id,
          name: item.name,
        }
        this.events.push(bodyData)
      })
    });
  }

  changeEvent() {

  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }
}
