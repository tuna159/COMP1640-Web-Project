import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  apiUrl: string = "http://localhost:3009/api/category";
  data: any;
  formGroup: FormGroup<{
    name: FormControl<string>;
  }>;
  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public config: DynamicDialogConfig,
    private http: HttpClient, private authService: AuthenticationService,) {
      this.data = this.config.data;
  }
  SaveIdea() {
    if(this.data.category_id == null) {
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
    });
    if(this.data.category_id != null) {
      this.setValueF();
    }
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
