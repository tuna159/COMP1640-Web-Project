import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { CreateAccountComponent } from '../manage-account/create-account/create-account/create-account.component';
import { Router } from '@angular/router';
import { AddEventComponent } from './add-event/add-event.component';

@Component({
  selector: 'app-manage-event',
  templateUrl: './manage-event.component.html',
  styleUrls: ['./manage-event.component.css'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class ManageEventComponent {
  cols: Array<any> = [];
  listData: any[] = [];
  displayDeleteEvent: boolean;
  displayDeleteEvents: boolean;
  id: number;
  ref: DynamicDialogRef;
  name: string;
  apiUrl: string = "http://localhost:3009/api/event";
  listSelectedData: Array<any> = [];
  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private router: Router,
    private http: HttpClient, private authService: AuthenticationService, private dialogService: DialogService) {
    this.getAllData();
  }

  ngOnInit() {

    this.cols = [
      { field: 'Number', header: 'Number', width: '5%', textAlign: 'center' },
      { field: 'name', header: 'Name', width: '15%', textAlign: 'center' },
      { field: 'Start Date', header: 'Start Date', width: '15%', textAlign: 'center' },
      { field: 'Closure Date', header: 'Closure Date', width: '10%', textAlign: 'center' },
      { field: 'Final Date', header: 'Final Date', width: '10%', textAlign: 'center' },
      { field: 'Department', header: 'Department', width: '10%', textAlign: 'center' },
      {
        field: 'Edit/Delete',
        header: 'Edit/Delete',
        width: '10%',
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
      this.listData = result.data.map((item, index) => Object.assign({
        Stt: index + 1,
      }, item));
    });


  }

  showDialogDelete(data) {
    this.displayDeleteEvent = true;
    this.id = data.category_id;
  }

  showDialogDeletes() {
    this.displayDeleteEvents = true;
  }

  deleteEvents() {
    if (this.listSelectedData.length) {
      for (let i = 0; i < this.listSelectedData.length; i++) {
        this.id = this.listSelectedData[i].category_id;
        this.deleteEvent();
      }
      this.listSelectedData = null;
    } else {
      this.displayDeleteEvents = false;
    }

  }

  async deleteEvent() {
    this.http.delete(this.apiUrl + '/' + this.id, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe(() => {
      this.showMessage('success', 'Delete success')
      this.displayDeleteEvent = false;
      this.displayDeleteEvents = false;
      this.getAllData();
    });
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }

  openNewEvent(data) {
    if (!data) {
      this.ref = this.dialogService.open(AddEventComponent, {
        header: 'Add Event',
        width: '40%',
        contentStyle: { "max-height": "800px", "overflow": "auto" },
        baseZIndex: 10000,
        data: {

        }
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.showMessage("Add success: ", result);
        }
        this.getAllData();
      });
    } else {
      this.ref = this.dialogService.open(AddEventComponent, {
        header: 'Edit Event',
        width: '40%',
        contentStyle: { "max-height": "800px", "overflow": "auto" },
        baseZIndex: 10000,
        data: data
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.showMessage("Edit success: ", result);
        }
        this.getAllData();
      });
    }
  }
}
