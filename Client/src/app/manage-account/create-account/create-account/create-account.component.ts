import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent {
  apiUrl: string = "http://localhost:3009/api/idea";
  categories = [
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' },
    { name: 'E' }
  ];
  formGroup: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    fullName: FormControl<string>;
    role: FormControl<string>;
    department: FormControl<string>;
    status: FormControl<string>;
  }>;
  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public config: DynamicDialogConfig,
    private http: HttpClient, private authService: AuthenticationService,) {


  }
  SaveIdea() {
    this.http.post(this.apiUrl, {
      "title": "XYZ",
      "content": "HEHE1",
      "category_ids": [1, 2],
      "files": [
        {
          "file": "pdf1",
          "size": 1
        },
        {
          "file": "pdf2",
          "size": 1
        },
        {
          "file": "pdf3",
          "size": 1
        }
      ],
      "is_anonymous": 1
    }, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      console.log(result);
    });
    this.closeDialog()
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      fullName: new FormControl(null, [Validators.required]),
      role: new FormControl(null, [Validators.required]),
      department: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
    });
  }

  closeDialog() {
    this.ref.close();
  }
}
