import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from '../auth/services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PostComponent } from '../idea-event/post/post.component';

@Component({
  selector: 'app-idea-category',
  templateUrl: './idea-category.component.html',
  styleUrls: ['./idea-category.component.css'],
  providers: [DialogService]
})
export class IdeaCategoryComponent {
  ref: DynamicDialogRef;
  listIdea = [];
  listData = [];
  Id: any;
  name: any;
  role: number;
  eventInfo: any;
  content: any;
  first_closure_date: any;
  final_closure_date: any;
  downloadEvent: boolean;
  listDepartments = [];
  listCategories = [];
  nameCt: any;
  formGroup: FormGroup<{
    category: FormControl<string>;
    department: FormControl<string>;
    startDate: FormControl<Date>;
    endDate: FormControl<Date>;
  }>;
  apiUrl = 'http://localhost:3009/api/category/';
  constructor(private dialogService: DialogService, private http: HttpClient, private route: ActivatedRoute,
    private authService: AuthenticationService, private router: Router, private messageService: MessageService) {
      this.role = authService.getRole();
      
      this.getAllIdeaByCategory();
      this.getAllDepartment();
  }


  getAllIdeaByCategory() {
      this.http.get<any>(this.apiUrl + this.Id + "/ideas", {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((res: any) => {
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
            category: item.category.name,
            like: item.likes,
            dislike: item.dislikes
          }
          this.listData.push(bodyData)
        })
        console.log("data: ", this.listData);
  
      })

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
    this.downloadEvent = true;
  }

  ngOnInit(): void {

    let obj: any
    this.route.queryParamMap.subscribe((params) => {
      obj = params;
      this.Id = obj.params.Id;
      this.nameCt = obj.params.name;
      this.getAllIdeaByCategory();
    }

  );

    this.getAllDepartment();
    this.getAllIdeaByCategory();
    this.formGroup = new FormGroup({
      category: new FormControl(null, [Validators.required]),
      department: new FormControl(this.listDepartments[0].name, [Validators.required]),
      startDate: new FormControl(this.eventInfo.first_closure_date, [Validators.required]),
      endDate: new FormControl(this.eventInfo.final_closure_date, [Validators.required]),
    });
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
            data: {
              Id: this.Id
            }
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
            this.showMessage("Add success: ", result);
        }
        this.getAllDepartment();
    });
  }
}
