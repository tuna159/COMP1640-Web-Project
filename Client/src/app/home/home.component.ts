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
  providers: [DialogService],
})
export class HomeComponent implements OnInit {
  ref: DynamicDialogRef;
  listIdea = [];
  listData = [];
  search_value: any;
  listDepartment = [];
  selectedNode: any;
  sortEvent: boolean;
  nodes1: any[];
  formGroup: FormGroup<{
    startDate: FormControl<Date>;
    endDate: FormControl<Date>;
    sort: FormControl<any>;
  }>;
  apiUrl = 'http://52.199.43.174:3009/api/idea';
  constructor(
    private dialogService: DialogService,
    private http: HttpClient,
    private authService: AuthenticationService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.getAllIdeas();
  }

  getAllIdeas() {
    this.http
      .get<any>(this.apiUrl, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((res: any) => {
        if (res.status_code != 200) {
          this.showMessage('error', res.message);
          return;
        }
        console.log('res.data', res.data);

        this.listIdea = res.data;
        this.listData = [];
        res.data.forEach((item) => {
          const tmp = item.tags.map((x) => x.name);
          let bodyData = {
            full_name: item.user.full_name,
            idea_id: item.idea_id,
            title: item.title,
            nameEvent: item.event.name,
            created_at: item.created_at,
            views: item.views,
            tag: item.tags,
            is_anonymous: item.is_anonymous,
            url_avatar:
              item.user.avatar_url == null
                ? 'https://vnn-imgs-f.vgcloud.vn/2020/03/23/11/trend-avatar-1.jpg'
                : item.user.avatar_url,
            nameTag: tmp.toString(),
            category: item.category.name,
            like: item.likes,
            dislike: item.dislikes,
          };
          this.listData.push(bodyData);
        });
        console.log('data: ', this.listData);
      });
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      sort: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
    });
  }

  IdeaDetail(IdIdeal): void {
    this.router.navigateByUrl('/detail', { state: { Id: IdIdeal } });
  }

  SaveSort() {
    let api = 'http://52.199.43.174:3009/api/idea';
    if (
      this.formGroup.controls.startDate.value &&
      this.formGroup.controls.endDate.value &&
      this.formGroup.controls.startDate.value.getTime() >
        this.formGroup.controls.endDate.value.getTime()
    ) {
      this.showMessage('error', 'Start Date must less than end date');
    }
    if (
      this.formGroup.controls.sort.value != null ||
      this.formGroup.controls.startDate.value != null ||
      this.formGroup.controls.endDate.value != null
    ) {
      api = api + '?';
    }
    // if(this.formGroup.controls.newest.value == true){
    //   if(api.slice(-1) == '?') {
    //     api = api + 'sorting_setting=RECENT_IDEAS'
    //   } else {
    //     api = api + '&sorting_setting=RECENT_IDEAS'
    //   }
    // }
    // if(this.formGroup.controls.mostPopular.value == true){
    //   if(api.slice(-1) == '?') {
    //     api = api + 'sorting_setting=MOST_POPULAR_IDEAS'
    //   } else {
    //     api = api + '&sorting_setting=MOST_POPULAR_IDEAS'
    //   }
    // }
    // if(this.formGroup.controls.mostView.value == true){
    //   if(api.slice(-1) == '?') {
    //     api = api + 'sorting_setting=MOST_VIEWED_IDEAS'
    //   } else {
    //     api = api + '&sorting_setting=MOST_VIEWED_IDEAS'
    //   }
    // }
    // if(this.formGroup.controls.startDate.value != null){
    //   if(api.slice(-1) == '?') {
    //     api = api + 'start_date=' + this.formGroup.controls.startDate.value.getFullYear()
    //   } else {
    //     api = api + '&start_date=' + this.formGroup.controls.startDate.value.getFullYear()
    //   }
    // }
    // if(this.formGroup.controls.endDate.value != null){
    //   if(api.slice(-1) == '?') {
    //     api = api + 'end_date=' + this.formGroup.controls.startDate.value.getFullYear()
    //   } else {
    //     api = api + '&end_date=' + this.formGroup.controls.startDate.value.getFullYear()
    //   }
    // }
    if (this.formGroup.controls.sort.value == 'newest') {
      if (api.slice(-1) == '?') {
        api = api + 'sorting_setting=RECENT_IDEAS';
      } else {
        api = api + '&sorting_setting=RECENT_IDEAS';
      }
    }
    if (this.formGroup.controls.sort.value == 'popular') {
      if (api.slice(-1) == '?') {
        api = api + 'sorting_setting=MOST_POPULAR_IDEAS';
      } else {
        api = api + '&sorting_setting=MOST_POPULAR_IDEAS';
      }
    }
    if (this.formGroup.controls.sort.value == 'views') {
      if (api.slice(-1) == '?') {
        api = api + 'sorting_setting=MOST_VIEWED_IDEAS';
      } else {
        api = api + '&sorting_setting=MOST_VIEWED_IDEAS';
      }
    }
    if (this.formGroup.controls.startDate.value != null) {
      if (api.slice(-1) == '?') {
        api =
          api +
          'start_date=' +
          this.formGroup.controls.startDate.value.getFullYear();
      } else {
        api =
          api +
          '&start_date=' +
          this.formGroup.controls.startDate.value.getFullYear();
      }
    }
    if (this.formGroup.controls.endDate.value != null) {
      if (api.slice(-1) == '?') {
        api =
          api +
          'end_date=' +
          this.formGroup.controls.startDate.value.getFullYear();
      } else {
        api =
          api +
          '&end_date=' +
          this.formGroup.controls.startDate.value.getFullYear();
      }
    }
    console.log(api);

    this.apiUrl = api;
    this.getAllIdeas();
    this.sortEvent = false;
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Notification:',
      detail: detail,
    });
  }
}
