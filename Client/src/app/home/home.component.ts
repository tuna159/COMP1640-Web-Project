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
        console.log(this.listIdea)
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
