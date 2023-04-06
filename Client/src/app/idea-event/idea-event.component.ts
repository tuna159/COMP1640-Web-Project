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
  listIdea = [];
  Id: any;
  name: any;
  role: number;
  content: any;
  first_closure_date: any;
  final_closure_date: any;
  apiUrl = 'http://localhost:3009/api/event/';
  constructor(private dialogService: DialogService, private http: HttpClient, private route: ActivatedRoute,
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) {
      this.role = authService.getRole();
      this.Id = this.router.getCurrentNavigation().extras.state.Id;
      this.getAllIdeaByEvent();
  }


  getAllIdeaByEvent() {
      this.http.get<any>(this.apiUrl + this.Id + "/ideas", {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((res: any) => {
        this.listIdea = res.data[0].ideas;
        console.log("idea: ", res.data[0].ideas);
        
        this.name = res.data[0].name;
        this.content = res.data[0].content;
        this.final_closure_date = res.data[0].final_closure_date;
        this.first_closure_date = res.data[0].first_closure_date;
      })

  }

  ngOnInit(): void {
    
  }
  
  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Notification:', detail: detail });
  }

  IdeaDetail(IdIdeal) : void{
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }

  postIdeal(){
    this.ref = this.dialogService.open(PostComponent, {
      header: 'Add ideal',
            width: '60%',
            contentStyle: {"max-height": "800px", "overflow": "auto"},
            baseZIndex: 10000,
    });
    this.ref.onClose.subscribe(() => {
      this.showMessage('success', 'Post successfully')
  });
  }
}
