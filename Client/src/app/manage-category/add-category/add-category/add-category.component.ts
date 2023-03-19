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
  apiUrl: string = "http://localhost:3009/api/idea";
  categories = [
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' },
    { name: 'E' }
  ];
  formGroup: FormGroup<{
    name: FormControl<string>;


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
      name: new FormControl(null, [Validators.required]),
    });
  }

  closeDialog() {
    this.ref.close();
  }
}
