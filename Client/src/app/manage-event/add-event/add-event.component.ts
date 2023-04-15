import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
  providers: [DatePipe, MessageService],
})
export class AddEventComponent implements OnInit {
  apiUrl: string = 'http://localhost:3009/api/event';
  data: any;
  listDepartments = [];
  formGroup: FormGroup<{
    name: FormControl<string>;
    content: FormControl<string>;
    closureDate: FormControl<Date>;
    finalDate: FormControl<Date>;
    department: FormControl<string>;
  }>;

  constructor(
    private dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private http: HttpClient,
    private authService: AuthenticationService,
    private datepipe: DatePipe,
    private messageService: MessageService
  ) {
    this.data = this.config.data;
    console.log(this.data);
    this.getAllDepartment();
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      content: new FormControl(null, [Validators.required]),
      closureDate: new FormControl(null, [Validators.required]),
      finalDate: new FormControl(null, [Validators.required]),
      department: new FormControl(null, [Validators.required]),
    });
    this.setValueF();
  }

  setValueF() {
    if (this.data.event_id != null) {
      this.formGroup.patchValue({
        name: this.data.name,
        content: this.data.content,
        closureDate: new Date(this.data.first_closure_date),
        finalDate: new Date(this.data.final_closure_date),
      });
    }
  }

  showMessage(status: string, message: string) {
    let msg = { severity: status, summary: 'Notification', detail: message };
    this.messageService.add(msg);
  }

  SaveEvent() {
    if (
      new Date(this.formGroup.controls.closureDate.value) >
      new Date(this.formGroup.controls.finalDate.value)
    ) {
      this.showMessage('error', 'Closure Date must before Final Date');
    }
    if (this.data.event_id == null) {
      this.http
        .post(
          this.apiUrl,
          {
            name: this.formGroup.controls.name.value,
            content: this.formGroup.controls.content.value,
            first_closure_date: this.datepipe.transform(
              new Date(this.formGroup.controls.closureDate.value),
              'yyyy-MM-ddThh:mm:ssZ'
            ),
            department_id:
              this.formGroup.controls.department.value['department_id'],
            final_closure_date: this.datepipe.transform(
              new Date(this.formGroup.controls.finalDate.value),
              'yyyy-MM-ddThh:mm:ssZ'
            ),
          },
          {
            headers: {
              Authorization: 'Bearer ' + this.authService.getToken(),
            },
          }
        )
        .subscribe((result: any) => {
          this.ref.close(this.formGroup.controls.name.value);
        });
    } else {
      this.http
        .put(
          this.apiUrl + '/' + this.data.event_id,
          {
            name: this.formGroup.controls.name.value,
            content: this.formGroup.controls.content.value,
            first_closure_date: this.datepipe.transform(
              new Date(this.formGroup.controls.closureDate.value),
              'yyyy-MM-ddThh:mm:ssZ'
            ),
            final_closure_date: this.datepipe.transform(
              new Date(this.formGroup.controls.finalDate.value),
              'yyyy-MM-ddThh:mm:ssZ'
            ),
          },
          {
            headers: {
              Authorization: 'Bearer ' + this.authService.getToken(),
            },
          }
        )
        .subscribe((result: any) => {
          this.ref.close(this.formGroup.controls.name.value);
        });
    }
  }

  getAllDepartment() {
    this.http
      .get<any>('http://localhost:3009/api/department', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((res: any) => {
        this.listDepartments = res.data;
      });
  }

  closeDialog() {
    this.ref.close();
  }
}
