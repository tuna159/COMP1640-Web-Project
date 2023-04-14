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
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnInit {
  apiUrlStaffDepartment: string = 'http://52.199.43.174:3009/api/event/';
  xStaffDepartment: any;
  dataStaffDepartment: any;

  years: number[] = [];
  yearValue: any;

  events: any;
  eventValue: any;

  ListDepartment = [];
  departmentStaffValue: any;
  departmentReactValue: any;

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

  // chart Thống kê comment of department by event
  barChartCommentDepartment = null;
  optionsBarChartCommentDepartment: Options = null;

  constructor(
    private chartsService: ChartServeice,
    private messageService: MessageService,
    private http: HttpClient,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.getListEvent();
    this.getListDepartment();
    this.getListYear();

    // line chart Thống kê react department
    this.optionsLineCharIdeaDepartment =
      chartsService.createLineCharIdeaDepartment(3, this.dataStaffDepartment);
    this.lineCharIdeaDepartment = new Chart(this.optionsLineCharIdeaDepartment);
  }

  ngOnInit(): void {}

  getListYear() {
    let currentYear: number = new Date().getFullYear();
    this.yearValue = currentYear;
    for (let i = currentYear - 7; i < currentYear + 7; i++) {
      this.years.push(i);
    }
  }

  getListDepartment() {
    this.http
      .get<any>('http://52.199.43.174:3009/api/department', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        this.ListDepartment = result.data;
        this.getStaffDepartment(this.ListDepartment[0].department_id);
        this.getReactDepartment(this.ListDepartment[0].department_id);
        this.getCommentDepartment(this.ListDepartment[0].department_id);
      });
  }
  getCommentDepartment(id: any) {
    this.http
      .get<any>(
        'http://52.199.43.174:3009/api/event/' +
          id +
          '/dashboard/staff-contribution',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        // chart Thống kê staff of department by event
        this.optionsBarChartStaffDepartment =
          this.chartsService.createBarChartStaffDepartment(
            result.data.map((x) => x.department_name),
            result.data.map((x) => x.total_staff),
            result.data.map((x) => x.staff_contributed)
          );
        this.barChartStaffDepartment = new Chart(
          this.optionsBarChartStaffDepartment
        );
      });
  }

  getStaffDepartment(id: any) {
    this.http
      .get<any>(
        'http://52.199.43.174:3009/api/department/' +
          id +
          '/dashboard/staff-contribution',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        let StaffContribute = result.data.staff_contributed;
        let totalStaff = result.data.total_staff;
        // pie chart Thống kê staff contribute
        this.optionsPieChartStaffContribute =
          this.chartsService.createPieChartStaffContributeDepartment(
            ((totalStaff - StaffContribute) / totalStaff) * 1000,
            (StaffContribute / totalStaff) * 100
          );
        this.pieChartStaffContribute = new Chart(
          this.optionsPieChartStaffContribute
        );
      });
  }

  getIdeaDepartment(id: any) {
    this.http.get<any>("http://localhost:3009/api/event/dashboard/staff-contribution?year=2020", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      if (result.status_code != 200) {
        this.showMessage('error', result.error_message);
        return;
      }
        let StaffContribute = result.data.staff_contributed
        let totalStaff = result.data.total_staff
        // pie chart Thống kê staff contribute
        this.optionsPieChartStaffContribute = this.chartsService.createPieChartStaffContributeDepartment((totalStaff - StaffContribute)/totalStaff * 1000, StaffContribute/totalStaff *100);
        this.pieChartStaffContribute = new Chart(this.optionsPieChartStaffContribute);
      })
  }

  getListEvent() {
    this.http
      .get<any>('http://52.199.43.174:3009/api/event', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        this.events = result.data;
        this.events = this.events.filter(
          (event) => event.department_id == null
        );
        console.log(this.events);
        this.getEvent(this.events[0].event_id);
      });
  }

  getEvent(id: number) {
    this.http
      .get<any>(
        'http://52.199.43.174:3009/api/event/' +
          id +
          '/dashboard/staff-contribution',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        // chart Thống kê staff of department by event
        this.optionsBarChartStaffDepartment =
          this.chartsService.createBarChartStaffDepartment(
            result.data.map((x) => x.department_name),
            result.data.map((x) => x.total_staff),
            result.data.map((x) => x.staff_contributed)
          );
        this.barChartStaffDepartment = new Chart(
          this.optionsBarChartStaffDepartment
        );
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  getReactDepartment(id: any) {
    this.http
      .get<any>(
        'http://52.199.43.174:3009/api/department/' +
          id +
          '/dashboard/reaction',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        // pie chart Thống kê react department
        this.optionsPieChartReactDepartment =
          this.chartsService.createPieChartReactDepartment(
            result.data.total_like /
              (result.data.total_like + result.data.total_dislike),
            result.data.total_dislike /
              (result.data.total_like + result.data.total_dislike)
          );
        this.pieChartReactDepartment = new Chart(
          this.optionsPieChartReactDepartment
        );
      });
  }

  //Change Event (Dropdown)
  changeEvent() {
    this.getEvent(this.eventValue.event_id);
  }

  changeDepartmentStaff() {
    if (this.departmentStaffValue != null) {
      this.getStaffDepartment(this.departmentStaffValue.department_id);
    }
  }

  changeDepartmentReact() {
    if (this.departmentReactValue != null) {
      this.getReactDepartment(this.departmentReactValue.department_id);
    }
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Thông báo:',
      detail: detail,
    });
  }
}
