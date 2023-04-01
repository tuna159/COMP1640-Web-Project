
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
  providers: [DialogService]
})
export class EventComponent implements OnInit {
  ref: DynamicDialogRef;
  listEvent = [];
  listDepartment = []
  selectedNode: any;
  nodes1: any[];
  Id = 1;
  nameDpm: any;
  apiUrl = 'http://localhost:3009/api/department/';
  constructor(private dialogService: DialogService, private http: HttpClient, private route: ActivatedRoute,
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) {
    
  }


  getAllEventsByDepartment() {
    this.listEvent = []
    this.http.get<any>(this.apiUrl + this.Id + "/events", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listEvent = res.data;
      console.log(this.listEvent);
    })
  }

  ngOnInit(): void {
    let obj: any
    this.route.queryParamMap.subscribe((params) => {
      obj = params;
      this.Id = obj.params.Id;
      this.nameDpm = obj.params.name;
      this.getAllEventsByDepartment();
    }
  );

  }

  EventDetail(IdEvent: any) {
    this.router.navigateByUrl('/event/ideas', { state: { Id: IdEvent } });
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }
}

