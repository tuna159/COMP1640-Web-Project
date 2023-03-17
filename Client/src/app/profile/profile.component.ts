import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';


interface Profile {
  id?: string;
  fullName?: string;
  gender?: boolean;
  birthday?: Date;
  prPhoneice?: number;
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

export class ProfileComponent {
  profileDialog: boolean;
  url: string;
  accountDialog: boolean;
  selectedValues: string;
  date: Date;
  Phone: number;
  password: string
  confirmPass: string
  name: string;
  gender: string;
  profile: Profile;
  account: Account;
  profileSubmitted: boolean;
  accountSubmitted: boolean;
  uploadedFiles: any[] = [];
  apiUrl:string = "http://localhost:3009/api/user/";

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, 
    private http : HttpClient, private router: Router,private authService: AuthenticationService,) { 
    this.getDataUser();
  }

  getDataUser() {
    this.http.get<any>(this.apiUrl + this.authService.getUserID(), {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.name = result.data.full_name;
              this.gender = result.data.gender == 1 ? "Male" : "Female";
              this.date = result.data.birthday;
          });

  }

  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }
  openProfile(profile: Profile) {
    this.profile = { ...profile };
    this.profileDialog = true;
  }

  openNew() {
    this.profile = {};
    this.profileSubmitted = false;
    this.profileDialog = true;
  }

  openNewAccount() {
    this.account = {};
    this.accountSubmitted = false;
    this.accountDialog = true;
  }

  openAccount(account: Account) {
    this.account = { ...account };
    this.accountDialog = true;
  }

  hideDialog() {
    this.profileDialog = false;
    this.accountDialog = false;
    this.profileSubmitted = false;
    this.accountSubmitted = false;
  }
  onselectFile(e){
    if(e.target.files){
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload=(event:any)=>{
        this.url = event.target.result;
      }
    }
  }

}