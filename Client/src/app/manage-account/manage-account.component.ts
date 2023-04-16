import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateAccountComponent } from './create-account/create-account/create-account.component';

@Component({
  selector: 'app-manage-account',
  templateUrl: './manage-account.component.html',
  styleUrls: ['./manage-account.component.css'],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class ManageAccountComponent {
  cols: Array<any> = [];
  listData: any[] = [];
  displayDeleteUser: boolean;
  displayDeleteUsers: boolean;
  id: number;
  ref: DynamicDialogRef;
  name: string;
  apiUrl: string = 'http://localhost:3009/api/user';
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
      { field: 'email', header: 'Email', width: '25%', textAlign: 'center' },
      {
        field: 'department',
        header: 'Department',
        width: '25%',
        textAlign: 'center',
      },
      {
        field: 'Create at',
        header: 'Create at',
        width: '10%',
        textAlign: 'center',
      },
      { field: 'status', header: 'Status', width: '25%', textAlign: 'center' },
      {
        field: 'edit',
        header: 'Edit',
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
        this.listData = result.data.map((item, index) =>
          Object.assign(
            {
              Stt: index + 1,
            },
            item
          )
        );
        this.listData.forEach((item) => {
          item.status = item.is_deleted == 0 ? 'Active' : 'UnActive';
        });
      },
      err => {
        this.showMessage('error', err.error.message);
        return;
      });
  }



  showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Notification:',
      detail: detail,
    });
  }

  openNewUser(data) {
    if (!data) {
      this.ref = this.dialogService.open(CreateAccountComponent, {
        header: 'Add Account',
        width: '40%',
        contentStyle: { 'max-height': '800px', overflow: 'auto' },
        baseZIndex: 10000,
        data: {},
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.showMessage('Add success: ', result);
        }
        this.getAllData();
      });
    } else {
      this.ref = this.dialogService.open(CreateAccountComponent, {
        header: 'Edit Account',
        width: '40%',
        contentStyle: { 'max-height': '800px', overflow: 'auto' },
        baseZIndex: 10000,
        data: data,
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.showMessage('Edit success: ', result);
        }
        this.getAllData();
      });
    }
  }
}
