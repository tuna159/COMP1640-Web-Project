import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.css'],
})
export class AddDepartmentComponent implements OnInit {
  apiUrl: string = 'http://52.199.43.174:3009/api/department';
  data: any;
  formGroup: FormGroup<{
    name: FormControl<string>;
  }>;

  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public config: DynamicDialogConfig,
    private http: HttpClient, private authService: AuthenticationService, private messageService: MessageService) {
      this.data = this.config.data;

  }

  SaveDepartment() {
    if(this.data.department_id == null) {
      this.http.post(this.apiUrl, {
        "name": this.formGroup.controls.name.value,
        }, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((result: any) => {
        this.ref.close(this.formGroup.controls.name.value);
      }, (err: any) => {
        this.showMessage("error: ", err.error.message);
  
      });
    } else {
      this.http.put(this.apiUrl + "/" + this.data.department_id, {
        "name": this.formGroup.controls.name.value,
        }, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((result: any) => {
        this.ref.close(this.formGroup.controls.name.value);
      }, (err: any) => {
        this.showMessage("error: ", err.error.message);
  
      });
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
    });
    this.setValueF();
  }

  setValueF() {
    this.formGroup.patchValue({
      name: this.data.name,
    });
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Notification:', detail: detail });
  }

  closeDialog() {
    this.ref.close();
  }
}
