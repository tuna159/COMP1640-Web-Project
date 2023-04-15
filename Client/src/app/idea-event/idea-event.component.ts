import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PostComponent } from './post/post.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-idea-event',
  templateUrl: './idea-event.component.html',
  styleUrls: ['./idea-event.component.css'],
  providers: [DialogService]
})
export class IdeaEventComponent implements OnInit {
  ref: DynamicDialogRef;
  listIdea = [];
  listData = [];
  listFileData = [];
  cols: Array<any> = [];
  listSelectedData: Array<any> = [];

  Id: any;
  dialogDownloadAtt: boolean;
  name: any;
  role: number;
  eventInfo: any;
  userDepartment: number;
  content: any;
  first_closure_date: any;
  final_closure_date: any;
  dialogDownloadEvent: boolean;
  exEvent: boolean = false;
  listDepartments = [];
  listCategories = [];
  formGroup: FormGroup<{
    category: FormControl<string>;
    department: FormControl<string>;
    startDate: FormControl<Date>;
    endDate: FormControl<Date>;
  }>;
  apiUrl = 'http://localhost:3009/api/event/';
  constructor(private dialogService: DialogService, private http: HttpClient, private route: ActivatedRoute,
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) {
      this.role = authService.getRole();
      
      this.userDepartment = authService.getDepartment();
      
      this.Id = this.router.getCurrentNavigation().extras.state.Id;
      this.getAllIdeaByEvent();
      this.getAllDepartment();
      this.getListCategory();
  }

  getListCategory() {
    this.http.get<any>("http://localhost:3009/api/category", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listCategories = res.data;
      
    })
  }
  getAllIdeaByEvent() {
      this.http.get<any>(this.apiUrl + this.Id + "/ideas", {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((res: any) => {
        this.eventInfo = res.data.event
        console.log(new Date(new Date().toDateString()).getTime() > new Date(new Date(res.data.event.final_closure_date).toDateString()).getTime());
        

        if(new Date(new Date().toDateString()).getTime() > new Date(new Date(res.data.event.final_closure_date).toDateString()).getTime())
        {
          this.exEvent = true;
        }
        
        
        this.listIdea = res.data;
        this.listData = [];
        res.data.ideas.forEach(item => {
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
            category: item.category.name,
            like: item.likes,
            dislike: item.dislikes
          }
          this.listData.push(bodyData)
        })
        }
      )
  }

  getAllDepartment() {
    this.http.get<any>("http://localhost:3009/api/department", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listDepartments = res.data;
    })
  
  }

  showDialogDownload() {
    this.dialogDownloadEvent = true;
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'Number', header: 'Number', width: '10%', textAlign: 'center' },
      { field: 'name', header: 'Name', width: '20%', textAlign: 'center' },
      { field: 'name', header: 'Download Link', width: '70%', textAlign: 'center' },
    ];

    this.userDepartment = this.authService.getDepartment();
    this.getListFile();
    this.getAllIdeaByEvent();
    this.getAllDepartment();
    this.getListCategory();
    this.formGroup = new FormGroup({
      category: new FormControl(null, [Validators.required]),
      department: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
    });
  }
  getListFile() {
    this.http.get<any>("http://localhost:3009/api/event/" + this.Id + "/attachments", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listFileData = res.data;
    })
  }
  
  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Notification:', detail: detail });
  }

  IdeaDetail(IdIdeal) : void{
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }

  downloadAtt() {
    let listData = this.listSelectedData.map(x => x.file_id)
    if(listData.length == 0) {
      this.showMessage("error: ", "please select the file you want to download");
    }else{
    this.http.get<any>("http://localhost:3009/api/event/" + this.Id + "/files/download?file_ids=["+ listData + "]", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      },
    },).subscribe((res: any) => {
      this.showMessage("Add success: ", res);
    })
    }
  }

  postIdeal(){
    this.ref = this.dialogService.open(PostComponent, {
      header: 'Add ideal',
            width: '60%',
            contentStyle: {"max-height": "800px", "overflow": "auto"},
            baseZIndex: 10000,
            data: {
              Id: this.Id
            }
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
            this.showMessage("Add success: ", result);
        }
        this.getAllIdeaByEvent();
    });
    
  }
  downloadEvent() {
    let bodyData = {
    
    }
    this.http.post<any>("http://localhost:3009/api/event/" + this.Id + "/download" , bodyData,{
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    } ).subscribe((res: any) => {
      console.log(res)
    }, (err: any) => {
      this.showMessage("err: ", err.error.message);

    })
  }
}
