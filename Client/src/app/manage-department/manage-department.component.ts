import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../auth/services/authentication.service';
import { AddDepartmentComponent } from './add-department/add-department.component';

@Component({
  selector: 'app-manage-department',
  templateUrl: './manage-department.component.html',
  styleUrls: ['./manage-department.component.css'],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class ManageDepartmentComponent {
  cols: Array<any> = [];
  listData: any[] = [];
  displayDeleteDepartment: boolean;
  displayDeleteDepartments: boolean;
  id: number;
  ref: DynamicDialogRef;
  name: string;
  apiUrl: string = 'http://52.199.43.174:3009/api/department';
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
        field: 'Manager Name',
        header: 'Manager Name',
        width: '15%',
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

  async getAllData() {
    this.http
      .get<any>(this.apiUrl, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        this.listData = result.data.map((item, index) =>
          Object.assign(
            {
              Stt: index + 1,
            },
            item
          )
        );
      });
  }

  showDialogDelete(data) {
    this.displayDeleteDepartment = true;
    this.id = data.department_id;
  }

  showDialogDeletes() {
    this.displayDeleteDepartments = true;
  }

  deleteDepartments() {
    if (this.listSelectedData.length) {
      for (let i = 0; i < this.listSelectedData.length; i++) {
        this.id = this.listSelectedData[i].department_id;
        this.deleteDepartment();
      }
      this.listSelectedData = null;
      this.displayDeleteDepartments = false;
    } else {
      this.displayDeleteDepartments = false;
    }
  }

  async deleteDepartment() {
    this.http
      .delete(this.apiUrl + '/' + this.id, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe(
        () => {
          this.showMessage('success', 'Delete success');
          this.displayDeleteDepartment = false;
          this.displayDeleteDepartments = false;
          this.getAllData();
        },
        (err: any) => {
          this.displayDeleteDepartment = false;
          this.displayDeleteDepartments = false;

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
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
  s;

  openNewDepartment(data) {
    if (!data) {
      this.ref = this.dialogService.open(AddDepartmentComponent, {
        header: 'Add Department',
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
      this.ref = this.dialogService.open(AddDepartmentComponent, {
        header: 'Edit Department',
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
