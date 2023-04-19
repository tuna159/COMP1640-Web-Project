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
  apiUrlStaffDepartment: string = 'http://localhost:3009/api/event/';
  xStaffDepartment: any;
  dataStaffDepartment: any;

  years = [];
  yearValue: any;

  events: any;
  eventValue: any;

  ListDepartment = [];
  departmentStaffValue: any;
  departmentReactValue: any;

  departments = [];
  departmentValue: any;
  role: number;

  // chart Thống kê staff of department by event
  barChartStaffEvent = null;
  optionsBarChartStaffEvent: Options = null;

  // pie chart Thống kê staff contribute
  pieChartStaffContribute = null;
  optionsPieChartStaffContribute: Options = null;

  // pie chart Thống kê react department
  pieChartReactDepartment = null;
  optionsPieChartReactDepartment: Options = null;

  // line chart Thống kê react department
  lineCharIdeaDepartment = null;
  optionsLineCharIdeaDepartment: Options = null;
  dataUser: any;

  // chart Thống kê comment of department by event
  // barChartCommentDepartment = null;
  // optionsBarChartCommentDepartment: Options = null;

  constructor(
    private chartsService: ChartServeice,
    private messageService: MessageService,
    private http: HttpClient,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.getListEvent();
    this.getDataUser();
    this.getListDepartment();
    this.getListYear();

    this.role = this.authService.getRole();
  }

  getDataUser() {
    if (this.authService.getRole() != 1) {
      this.http
        .get<any>(
          'http://localhost:3009/api/user/' + this.authService.getUserID(),
          {
            headers: {
              Authorization: 'Bearer ' + this.authService.getToken(),
            },
          }
        )
        .subscribe((result: any) => {
          this.dataUser = result.data;
        });
    }
  }

  ngOnInit(): void {}

  getListYear() {
    let date = new Date();
    let currentYear = date.getFullYear();
    for (let i = currentYear - 20; i < currentYear + 20; i++) {
      let data = {
        name: i,
      };
      this.years.push(data);
    }
    let setData = {
      name: currentYear,
    };
    this.yearValue = setData;
  }

  getListDepartment() {
    this.http
      .get<any>('http://localhost:3009/api/department', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        this.ListDepartment = result.data;
        this.getReactDepartment(this.ListDepartment[0].department_id);
        this.getStaffEvent(this.ListDepartment[0].department_id);
        let date = new Date();
        this.getIdeaDepartment(date.getFullYear());
      });
  }

  getStaffEvent(id: any) {
    this.http
      .get<any>(
        'http://localhost:3009/api/department/' +
          id +
          '/dashboard/staff-contribution',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        let StaffContribute = result.data.staff_contributed;
        let totalStaff = result.data.total_staff;
        // pie chart Thống kê staff contribute
        this.optionsPieChartStaffContribute =
          this.chartsService.createPieChartStaffContributeDepartment(
            ((totalStaff - StaffContribute) / totalStaff) * 100,
            (StaffContribute / totalStaff) * 100
          );
        this.pieChartStaffContribute = new Chart(
          this.optionsPieChartStaffContribute
        );
      });
  }

  getIdeaDepartment(id: any) {
    this.http
      .get<any>(
        'http://localhost:3009/api/event/dashboard/staff-contribution?year=' +
          id,
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        let data = [];
        result.data.forEach((element) => {
          let bodyData = {
            name: element.department_name,
            data: element.contribution,
          };
          data.push(bodyData);
        });
        console.log(data);

        // line chart Thống kê react department
        this.optionsLineCharIdeaDepartment =
          this.chartsService.createLineCharIdeaDepartment(id, data);
        this.lineCharIdeaDepartment = new Chart(
          this.optionsLineCharIdeaDepartment
        );
      });
  }

  getListEvent() {
    this.http
      .get<any>('http://localhost:3009/api/event', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        this.events = result.data;
        this.events = this.events.filter(
          (event) => event.department_id == null
        );
        this.getEvent(this.events[0].event_id);
      });
  }

  getEvent(id: number) {
    this.http
      .get<any>(
        'http://localhost:3009/api/event/' +
          id +
          '/dashboard/staff-contribution',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
        // chart Thống kê staff of department by event
        this.optionsBarChartStaffEvent =
          this.chartsService.createBarChartStaffEvent(
            result.data.map((x) => x.department_name),
            result.data.map((x) => x.total_staff),
            result.data.map((x) => x.staff_contributed)
          );
        this.barChartStaffEvent = new Chart(this.optionsBarChartStaffEvent);
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  getReactDepartment(id: any) {
    this.http
      .get<any>(
        'http://localhost:3009/api/department/' + id + '/dashboard/reaction',
        {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        }
      )
      .subscribe((result: any) => {
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
      this.getStaffEvent(this.departmentStaffValue.department_id);
    }
  }

  changeDepartmentReact() {
    if (this.departmentReactValue != null) {
      this.getReactDepartment(this.departmentReactValue.department_id);
    }
  }
  changeIdeaDepartment() {
    if (this.yearValue != null) {
      this.getIdeaDepartment(this.yearValue.name);
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
