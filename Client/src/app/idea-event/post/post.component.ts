import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';



@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  apiUrl: string = "http://localhost:3009/api/event/";
  categories = [];
  uploadedFiles: any[] = [];
  Id; any;
  file: any
  url: string;
  formGroup: FormGroup<{
    category: FormControl<string>;
    title: FormControl<string>;
    tagName: FormControl<string>;
    content: FormControl<string>;
    checked: FormControl<boolean>;
    anonymous: FormControl<boolean>;
  }>;

  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public config: DynamicDialogConfig,
    private http: HttpClient, private authService: AuthenticationService, private messageService: MessageService) {
      this.Id = this.config.data;
      // console.log(this.data)
      this.getListCategory();
  }

  getListCategory() {
    this.http.get<any>("http://localhost:3009/api/category", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.categories = res.data;
      console.log(this.categories);
    })
  }
  async SaveIdea() {
    if(this.file.name.length) {

      const formData: FormData = new FormData();

      formData.append('files', this.file, this.file.name);
      await this.http.post<any>("http://localhost:3009/api/upload", formData , {headers: { Authorization: 'Bearer ' + this.authService.getToken()}
        }).subscribe((result: any) => {
          this.save(result.data)
        });
    } else {
      this.save('')
    }
    this.closeDialog()
  }

  save(data: any) {
    this.http.post(this.apiUrl +  this.Id + '/ideas', {
      "title": this.formGroup.controls.title.value,
      "content": this.formGroup.controls.content.value,
      "category_ids": this.formGroup.controls.category.value['category_id'],
      "files": data,
      "is_anonymous": this.formGroup.controls.anonymous.value == true ? 1 : 0
    }, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      console.log(result);
    });
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      category: new FormControl(null, [Validators.required]),
      title: new FormControl(null, [Validators.required]),
      tagName: new FormControl(null, [Validators.required]),
      content: new FormControl(null, [Validators.required]),
      checked: new FormControl(false, [Validators.required]),
      anonymous: new FormControl(false, [Validators.required]),
    });
  }

  closeDialog() {
    this.ref.close();
  }

  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }
  
  onselectFile(e){
    if(e.target.files){
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload=(event:any)=>{
        this.url = event.target.result;
      }
      this.file = e.target.files[0]
    }
  }
}
