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
  Id: any;
  name: any;
  role: number;
  eventInfo: any;
  userDepartment: number;
  content: any;
  first_closure_date: any;
  final_closure_date: any;
  downloadEvent: boolean;
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
  }


  getAllIdeaByEvent() {
      this.http.get<any>(this.apiUrl + this.Id + "/ideas", {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((res: any) => {
        
        this.listIdea = res.data[0].ideas;
        this.eventInfo = res.data[0];

        console.log("idea: ", res.data[0]);

        console.log("department: ", this.userDepartment);
        this.name = res.data[0].name;
        this.content = res.data[0].content;
        this.final_closure_date = res.data[0].final_closure_date;
        this.first_closure_date = res.data[0].first_closure_date;
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
    this.downloadEvent = true;
  }

  ngOnInit(): void {
    this.userDepartment = this.authService.getDepartment();
    this.getAllIdeaByEvent();
    this.getAllDepartment();
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
        this.getAllIdeaByEvent();
    });
  }
}
