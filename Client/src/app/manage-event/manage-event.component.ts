import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Router } from '@angular/router';
import { AddEventComponent } from './add-event/add-event.component';

@Component({
  selector: 'app-manage-event',
  templateUrl: './manage-event.component.html',
  styleUrls: ['./manage-event.component.css'],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class ManageEventComponent {
  cols: Array<any> = [];
  listData: any[] = [];
  displayDeleteEvent: boolean;
  displayDeleteEvents: boolean;
  id: number;
  listDepartments = [];
  ref: DynamicDialogRef;
  name: string;
  apiUrl: string = 'http://52.199.43.174:3009/api/event';
  listSelectedData: Array<any> = [];
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthenticationService,
    private dialogService: DialogService
  ) {
    this.getAllData();
  }

  ngOnInit() {
    this.cols = [
      { field: 'Number', header: 'Number', width: '5%', textAlign: 'center' },
      { field: 'name', header: 'Name', width: '15%', textAlign: 'center' },
      {
        field: 'Create on',
        header: 'Create on',
        width: '15%',
        textAlign: 'center',
      },
      {
        field: 'Closure Date',
        header: 'Closure Date',
        width: '10%',
        textAlign: 'center',
      },
      {
        field: 'Final Date',
        header: 'Final Date',
        width: '10%',
        textAlign: 'center',
      },
      {
        field: 'Department',
        header: 'Department',
        width: '10%',
        textAlign: 'center',
      },
      {
        field: 'Edit/Delete',
        header: 'Edit/Delete',
        width: '10%',
        textAlign: 'center',
      },
    ];
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  async getAllData() {
    let listDepartment = [];
    this.http
      .get<any>(this.apiUrl, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.message);
          return;
        }
        this.http
          .get<any>('http://52.199.43.174:3009/api/department', {
            headers: {
              Authorization: 'Bearer ' + this.authService.getToken(),
            },
          })
          .subscribe((res: any) => {
            listDepartment = res.data;
            this.listData = result.data.map((item, index) =>
              Object.assign(
                {
                  Stt: index + 1,
                  department: listDepartment.find(
                    (x) => x.department_id == item.department_id
                  ),
                },
                item
              )
            );
          });
      });
  }
  getAllDepartment() {
    this.http
      .get<any>('http://52.199.43.174:3009/api/department', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((res: any) => {
        if (res.status_code != 200) {
          this.showMessage('error', res.message);
          return;
        }
        this.listDepartments = res.data;
      });
  }

  showDialogDelete(data) {
    this.displayDeleteEvent = true;
    this.id = data.event_id;
  }

  showDialogDeletes() {
    this.displayDeleteEvents = true;
  }

  deleteEvents() {
    if (this.listSelectedData.length) {
      for (let i = 0; i < this.listSelectedData.length; i++) {
        this.id = this.listSelectedData[i].event_id;
        this.deleteEvent();
      }
      this.listSelectedData = null;
    } else {
      this.displayDeleteEvents = false;
    }
  }

  async deleteEvent() {
    this.http
      .delete(this.apiUrl + '/' + this.id, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe(
        (result: any) => {
          this.showMessage('success', 'Delete success');
          this.displayDeleteEvent = false;
          this.displayDeleteEvents = false;
          this.getAllData();
        },
        (err: any) => {
          this.showMessage('error: ', err.error.message);
        }
      );
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Notification:',
      detail: detail,
    });
  }

  openNewEvent(data) {
    if (!data) {
      this.ref = this.dialogService.open(AddEventComponent, {
        header: 'Add Event',
        width: '40%',
        contentStyle: { 'max-height': '800px', overflow: 'auto' },
        baseZIndex: 10000,
        data: {},
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.showMessage('Add success: ', result);
          this.getAllData();
        }
      });
    } else {
      this.ref = this.dialogService.open(AddEventComponent, {
        header: 'Edit Event',
        width: '40%',
        contentStyle: { 'max-height': '800px', overflow: 'auto' },
        baseZIndex: 10000,
        data: data,
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.showMessage('Edit success: ', result);
          this.getAllData();
        }
      });
    }
  }
}
