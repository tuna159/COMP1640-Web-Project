import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { PostComponent } from '../idea-event/post/post.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  sortEvent: boolean;
  nodes1: any[];
  formGroup: FormGroup<{
    newest: FormControl<any>;
    mostPopular: FormControl<any>;
    startDate: FormControl<Date>;
    endDate: FormControl<Date>;
    mostView: FormControl<any>;
  }>;
  apiUrl = 'http://localhost:3009/api/idea';
  constructor(private dialogService: DialogService, private http: HttpClient, 
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) { 
    this.getAllIdeas();
  }


  getAllIdeas() {
      this.http.get<any>(this.apiUrl, {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((res:any)=>{
        console.log("res.data", res.data);
        
        this.listIdea = res.data;
        this.listData = [];
        res.data.forEach(item => {
          const tmp = item.tags.map(x => x.name);
          let bodyData = {
            full_name: item.user.full_name,
            idea_id: item.idea_id,
            title: item.title,
            nameEvent: item.event.name,
            created_at: item.created_at,
            views: item.views, 
            tag: item.tags,
            is_anonymous: item.is_anonymous,
            url_avatar: item.user.avatar_url == null ? "https://vnn-imgs-f.vgcloud.vn/2020/03/23/11/trend-avatar-1.jpg" : item.user.avatar_url,
            nameTag: tmp.toString(),
          }
          this.listData.push(bodyData)
        })
        console.log("data: ", this.listData);
        
      })
  }

  
  ngOnInit(): void {
    this.formGroup = new FormGroup({
      newest: new FormControl(null, [Validators.required]),
      mostPopular: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      mostView: new FormControl(null, [Validators.required]),
    });
  }

  IdeaDetail(IdIdeal) : void{
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }
  
  SaveSort() {
    let api = 'http://localhost:3009/api/idea'
    if(this.formGroup.controls.newest.value == true || 
        this.formGroup.controls.mostPopular.value == true||
        this.formGroup.controls.mostView.value == true||
        this.formGroup.controls.startDate.value != null||
        this.formGroup.controls.endDate.value != null) {
      api = api + '?'
    }
    if(this.formGroup.controls.newest.value == true){
      if(api.slice(-1) == '?') {
        api = api + 'sorting_setting=RECENT_IDEAS'
      } else {
        api = api + '&sorting_setting=RECENT_IDEAS'
      }
    }
    if(this.formGroup.controls.mostPopular.value == true){
      if(api.slice(-1) == '?') {
        api = api + 'sorting_setting=MOST_POPULAR_IDEAS'
      } else {
        api = api + '&sorting_setting=MOST_POPULAR_IDEAS'
      }
    }
    if(this.formGroup.controls.mostView.value == true){
      if(api.slice(-1) == '?') {
        api = api + 'sorting_setting=MOST_VIEWED_IDEAS'
      } else {
        api = api + '&sorting_setting=MOST_VIEWED_IDEAS'
      }
    }
    if(this.formGroup.controls.startDate.value != null){
      if(api.slice(-1) == '?') {
        api = api + 'start_date=' + this.formGroup.controls.startDate.value.getFullYear()
      } else {
        api = api + '&start_date=' + this.formGroup.controls.startDate.value.getFullYear()
      }
    }
    if(this.formGroup.controls.endDate.value != null){
      if(api.slice(-1) == '?') {
        api = api + 'end_date=' + this.formGroup.controls.startDate.value.getFullYear()
      } else {
        api = api + '&end_date=' + this.formGroup.controls.startDate.value.getFullYear()
      }
    }
    this.apiUrl = api;
    this.getAllIdeas()
    this.sortEvent = false;
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Notification:', detail: detail });
  }
}
