import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Router } from '@angular/router';
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
  listIdea = [];
  listDepartment = []
  selectedNode: any;
  nodes1: any[];
  apiUrl = 'http://localhost:3009/api/idea';
  constructor(private dialogService: DialogService, private http: HttpClient,
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) {
    this.getAllIdeas();
    this.getAllDepartment()
  }


  getAllIdeas() {
    this.http.get<any>(this.apiUrl, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listIdea = res.data;
    })
  }
  getAllDepartment() {
    this.http.get<any>("http://localhost:3009/api/department", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listDepartment = res.data;
    })
  }
  ngOnInit(): void {

  }
  UserDetail(Id): void {
    console.log(Id)
  }
  IdeaDetail(IdIdeal): void {
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }
  postIdeal() {
    this.ref = this.dialogService.open(PostComponent, {
      header: 'Add ideal',
      width: '90%',
      height: '90%',
      contentStyle: { "max-height": "800px", "overflow": "auto" },
      baseZIndex: 10000,
    });
    this.ref.onClose.subscribe(() => {
      this.showMessage('success', 'Post successfully')
    });
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Thông báo:', detail: detail });
  }
}
