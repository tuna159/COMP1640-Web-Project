import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { PostComponent } from './post/post.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DialogService]
})
export class HomeComponent implements OnInit{
  ref: DynamicDialogRef;
  listIdea = [];
  listData = [];
  search_value: any;
  listDepartment = []
  selectedNode: any;
  nodes1: any[];
  apiUrl = 'http://localhost:3009/api/idea';
  constructor(private dialogService: DialogService, private http: HttpClient, 
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) { 
    this.getAllIdeas();
  }


  getAllIdeas() {
      this.http.get<any>(this.apiUrl, {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((res:any)=>{
        this.listIdea = res.data;
        this.listIdea.forEach(item => {
          const tmp = item.tags.map(x => x.name);
          console.log(item.tags)
          let bodyData = {
            full_name: item.user.full_name,
            idea_id: item.idea_id,
            title: item.title,
            nameEvent: item.event.name,
            created_at: item.created_at,
            views: item.views, 
            tag: item.tags,
            url_avatar: item.user.avatar_url,
            nameTag: tmp.toString(),
          }
          this.listData.push(bodyData)
        })
        console.log(this.listData)
      })
  }

  changeSearch() {
    this.http.get<any>("http://localhost:3009/api/idea/search?search_key=" + this.search_value, {headers: {
      Authorization: 'Bearer ' + this.authService.getToken()}
    }).subscribe((res:any)=>{
      this.listIdea = res.data;
    })
  }
  
  ngOnInit(): void {
    
  }

  IdeaDetail(IdIdeal) : void{
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }
  postIdeal(){
    this.ref = this.dialogService.open(PostComponent, {
      header: 'Add ideal',
            width: '90%',
            height: '90%',
            contentStyle: {"max-height": "800px", "overflow": "auto"},
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
