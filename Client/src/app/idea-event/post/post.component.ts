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
  listFile: any[] = [];
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
    private http: HttpClient, private authService: AuthenticationService, private messageService: MessageService, private router: Router) {
      this.Id = this.config.data;
      console.log(this.Id)
      this.getListCategory();
  }

  getListCategory() {
    
    this.http.get<any>("http://localhost:3009/api/category", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.categories = res.data;
    })
  }
  async SaveIdea() {
    if(this.listFile.length) {
      const formData: FormData = new FormData();
      for(let i = 0; i < this.listFile.length; i++) {
        formData.append('files', this.listFile[i], this.listFile[i].name);
      }
      await this.http.post<any>("http://localhost:3009/api/upload/files", formData ,
      {headers: { Authorization: 'Bearer ' + this.authService.getToken()}
        }).subscribe((result: any) => {
          this.save(result.data)
        });
    } else {
      this.save('')
    }
    this.closeDialog()
  }

  save(data: any) {

    let bodyData = {
      "title": this.formGroup.controls.title.value,
      "content": this.formGroup.controls.content.value,
      "category_id": this.formGroup.controls.category.value['category_id'],
      "files": data,
      "tag_names": [{"name": this.formGroup.controls.tagName.value}],
      "is_anonymous": this.formGroup.controls.anonymous.value == true ? 1 : 0
    }

    this.http.post(this.apiUrl +  this.Id.Id + '/ideas', bodyData, {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((result: any) => {
      this.router.navigateByUrl('/event/ideas', { state: { Id: this.Id.Id } });

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

  // onUpload(event) {
  //   for (let file of event.files) {
  //     this.uploadedFiles.push(file);
  //   }
  //   this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  // }
  
  onselectFile(e){
    if(e.target.files){
      for(let i = 0; i < e.target.files.length; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[i]);
        reader.onload=(event:any)=>{
          this.url = event.target.result;
        }
        this.listFile.push(e.target.files[i]) 
      }
      console.log(this.listFile);
    }
  }
}
