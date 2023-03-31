import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PostComponent } from '../home/post/post.component';

@Component({
  selector: 'app-idea-event',
  templateUrl: './idea-event.component.html',
  styleUrls: ['./idea-event.component.css'],
  providers: [DialogService]
})
export class IdeaEventComponent implements OnInit {
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
  
  IdeaDetail(IdIdeal): void {
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }


  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Notification:', detail: detail });
  }
}
