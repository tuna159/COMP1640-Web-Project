import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';

@Component({
  selector: 'app-manage-semester',
  templateUrl: './manage-semester.component.html',
  styleUrls: ['./manage-semester.component.css']
})
export class ManageSemesterComponent {
  cols: Array<any> = [];
  listData: any[] = [];
  displayXoa: boolean;
  displayXoaN: boolean;
  id: number;
  name: string;
  apiUrl: string = "http://localhost:3009/api/semester";
  listSelectedData: Array<any> = [];
  constructor(private messageService: MessageService, private router : Router,
    private http : HttpClient, private authService: AuthenticationService) { 
    this.getAllData();
  }

  ngOnInit() {

    this.cols = [
      { field: 'Stt', header: 'STT', width: '50px', textAlign: 'center' },
      { field: 'name', header: 'Name', width: '300px', textAlign: 'center' },
      { field: 'startD', header: 'Start Date', width: '300px', textAlign: 'center' },
      { field: 'closureD', header: 'closure Date', width: '300px', textAlign: 'center' },
      { field: 'finalD', header: 'Final Date', width: '300px', textAlign: 'center' },
      {
        field: 'ThaoTac',
        header: 'Thao tác',
        width: '120px',
        textAlign: 'center',
      },
    ];
  }
  
  async getAllData() {
    this.http.get<any>(this.apiUrl, {headers: {
      Authorization: 'Bearer ' + this.authService.getToken()}
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
    this.id = data.semester_id;
  }

  showDialogXoaN() {
    this.displayXoaN = true;
  }

  xoaNTo() {
    if(this.listSelectedData.length){
      for(let i = 0; i < this.listSelectedData.length; i++) {
        this.id = this.listSelectedData[i].semester_id;
        this.xoaTo();
      }
      this.listSelectedData = null;
    }else{
      this.displayXoaN = false;
    }
    
  }

  async xoaTo() { 
    this.http.delete(this.apiUrl +'/'+ this.id, {headers: {
      Authorization: 'Bearer ' + this.authService.getToken()}
    }).subscribe(() => 
        this.showMessage('success', 'Delete success'));
    this.displayXoa = false;
    this.displayXoaN = false;
    
    this.getAllData();
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }

  addSemester(){
    this.http.post(this.apiUrl, {"name" : "hehe"}, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      console.log(result);
    });
    this.getAllData();
  }
}
