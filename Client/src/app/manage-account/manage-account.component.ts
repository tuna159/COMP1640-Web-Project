import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';

@Component({
  selector: 'app-manage-account',
  templateUrl: './manage-account.component.html',
  styleUrls: ['./manage-account.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ManageAccountComponent {
  breadcrumb: any[];
  cols: Array<any> = [];
  listData: any[] = [];
  displayXoa: boolean;
  displayXoaN: boolean;
  id: number;
  name: string;
  apiUrl: string = "http://localhost:3009/api/category";
  listSelectedData: Array<any> = [];
  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private router: Router,
    private http: HttpClient, private authService: AuthenticationService) {
    this.getAllData();
  }

  ngOnInit() {

    this.cols = [
      { field: 'Stt', header: 'STT', width: '50px', textAlign: 'center' },
      { field: 'email', header: 'Email', width: '300px', textAlign: 'center' },
      { field: 'name', header: 'Full Name', width: '300px', textAlign: 'center' },
      { field: 'role', header: 'Role', width: '200px', textAlign: 'center' },
      { field: 'department', header: 'Department', width: '100px', textAlign: 'center' },
      { field: 'status', header: 'Status', width: '150px', textAlign: 'center' },
      {
        field: 'ThaoTac',
        header: 'Thao tác',
        width: '120px',
        textAlign: 'center',
      },
    ];
  }

  async getAllData() {
    this.http.get<any>(this.apiUrl, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      if (result.status_code != 200) {
        this.showMessage('error', result.error_message);
        return;
      }
      console.log(result)
      this.listData = result.data.map((item, index) => Object.assign({
        Stt: index + 1,
      }, item));
      console.log(this.listData)
    });


  }

  chinhSua(data) {
    this.router.navigateByUrl('/');
  }

  showDialogXoa(data) {
    this.displayXoa = true;
    this.id = data.category_id;
  }

  showDialogXoaN() {
    this.displayXoaN = true;
  }

  xoaNTo() {
    if (this.listSelectedData.length) {
      for (let i = 0; i < this.listSelectedData.length; i++) {
        this.id = this.listSelectedData[i].category_id;
        this.xoaTo();
      }
      this.listSelectedData = null;
    } else {
      this.displayXoaN = false;
    }

  }

  async xoaTo() {
    this.http.delete(this.apiUrl + '/' + this.id, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe(() =>
      this.showMessage('success', 'Delete success'));
    this.displayXoa = false;
    this.displayXoaN = false;

    this.getAllData();
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }
}
