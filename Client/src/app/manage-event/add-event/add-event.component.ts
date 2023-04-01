import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  apiUrl: string = "http://localhost:3009/api/event";
  data: any;
  formGroup: FormGroup<{
    name: FormControl<string>;
    startDate: FormControl<string>;
    closuretDate: FormControl<string>;
    finaltDate: FormControl<string>;
    department: FormControl<string>;
  }>;

  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public config: DynamicDialogConfig,
    private http: HttpClient, private authService: AuthenticationService,) {
      this.data = this.config.data;
      console.log(this.data)
  }

  SaveIdea() {
    if(this.data.event_id == null) {
      this.http.post(this.apiUrl, {
        "name": this.formGroup.controls.name.value,
        }, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((result: any) => {
        this.ref.close(this.formGroup.controls.name.value);
      });
    } else {
      this.http.put(this.apiUrl + "/" + this.data.category_id, {
        "name": this.formGroup.controls.name.value,
        }, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((result: any) => {
        this.ref.close(this.formGroup.controls.name.value);
      });
    }

  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      closuretDate: new FormControl(null, [Validators.required]),
      finaltDate: new FormControl(null, [Validators.required]),
      department: new FormControl('All Department', [Validators.required]),
    });
    this.setValueF()
  }

  setValueF() {
    this.formGroup.patchValue({
      name: this.data.name, 
    })
  }

  

  closeDialog() {
    this.ref.close();
  }
}
