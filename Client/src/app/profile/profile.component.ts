import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


interface Profile {
  id?: string;
  fullName?: string;
  gender?: boolean;
  birthday?: Date;
}

interface Account {
  id?: string;
  email?: string;
  password?: string;
  confirmPass?: string;
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [MessageService, ConfirmationService]
})

export class ProfileComponent implements OnInit {
  profileDialog: boolean;
  url: string;
  accountDialog: boolean;
  selectedValues: string;
  date: string;
  password: string
  confirmPass: string
  name: string;
  gender: string;
  profile: Profile;
  account: Account;
  email: string;
  profileSubmitted: boolean;
  accountSubmitted: boolean;
  uploadedFiles: any[] = [];
  fileImage: any
  urlImage: any
  avatar_url: any
  apiUrl:string = "http://localhost:3009/api/user/";
  apiURLEditInfor = "http://localhost:3009/api/me";
  
  formGroup: FormGroup<({
    name: FormControl<string>;
    gender: FormControl<string>;
    birthday: FormControl<Date>;
  })>;

  formEditAccount: FormGroup<({
    password: FormControl<string>;
    oldPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  })>;

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, 
    private http : HttpClient, private router: Router,private authService: AuthenticationService,) { 
    this.getDataUser();
    
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      gender: new FormControl(null, [Validators.required]), 
      birthday: new FormControl(null, [Validators.required]),
    });
    this.formEditAccount = new FormGroup({
      password: new FormControl(null, [Validators.required]),
      oldPassword: new FormControl(null, [Validators.required]), 
      confirmPassword: new FormControl(null, [Validators.required])
    })
  }

  getDataUser() {
    this.http.get<any>(this.apiUrl + this.authService.getUserID(), {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
            console.log(result);
            this.name = result.data.nick_name;
            this.gender = result.data.gender == 1 ? "Male" : "Female";
            this.date = result.data.birthday;
            this.email = result.data.email;
            this.avatar_url = result.data.avatar_url
          });

  }

  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }



  async SaveEditInfor() {
    if(this.fileImage.name.length) {
      const formData: FormData = new FormData();

      formData.append('files', this.fileImage, this.fileImage.name);

      await this.http.post<any>("http://localhost:3009/api/upload", formData , {headers: { Authorization: 'Bearer ' + this.authService.getToken()}
        }).subscribe((result: any) => {
          this.save(result.data[0].file_url)
        });
    }else{
      this.save('')
    }

  }
  
  save(url: any) {
    let dateBirth =""
    if(this.formGroup.controls.birthday.value.getMonth() + 1 <= 9){
      dateBirth = this.formGroup.controls.birthday.value.getFullYear() + "-0" + 
      (this.formGroup.controls.birthday.value.getMonth() +1 ) + "-"+ 
      this.formGroup.controls.birthday.value.getDate();
    }else{
      dateBirth = this.formGroup.controls.birthday.value.getFullYear() + "-" + 
      this.formGroup.controls.birthday.value.getMonth() + "-"+ 
      this.formGroup.controls.birthday.value.getDate();
    }
    this.http.put<any>(this.apiURLEditInfor,{
      "nick_name" : this.formGroup.controls.name.value,
      "gender" : this.formGroup.controls.gender.value == "Male" ? 1 : 2,
      "birthdate": dateBirth,
      "avatar_url": url
  } , {headers: {
      Authorization: 'Bearer ' + this.authService.getToken()}
    }).subscribe((result: any) => {
      this.getDataUser();
      this.hideDialog() ;
    });
  }
  

  SaveEditAccount() {
    if(this.formEditAccount.controls.password != this.formEditAccount.controls.confirmPassword) {
      alert("Please re-enter your password. Password and confirm password are not the same")
    }
    
  }

  openEditYourInformation() {
    this.profileDialog = true;
    this.setValueEditInfor();
  }

  setValueEditInfor() {
    this.formGroup.patchValue({
      name: this.name, 
      gender: this.gender, 
      birthday: new Date(this.date), 

    })
  }

  openEditYourAccount() {
    this.accountDialog = true;
  }

  hideDialog() {
    this.profileDialog = false;
    this.accountDialog = false;
    this.profileSubmitted = false;
    this.accountSubmitted = false;
    this.formGroup.reset();
    Object.keys(this.formGroup.controls).forEach(key => {
      this.formGroup.get(key).setErrors(null) ;
    });
  }

  onselectFile(e){
    if(e.target.files){
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload=(event:any)=>{
        this.url = event.target.result;
      }
      this.fileImage = e.target.files[0]
    }
  }
  

}

