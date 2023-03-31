import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {

  formGroup: FormGroup<({
    email: FormControl<string>;
    password: FormControl<string>;
  })>;

  constructor(
    private authService: AuthenticationService,
    private http: HttpClient,
    public router: Router,
    private messageService: MessageService,
  ) {
    // redirect to home if already logged in
    if (this.authService.getUser()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  signUp(){
    if (this.formGroup.invalid) {
      if (!this.formGroup.value.email && !this.formGroup.value.password) {
        this.showMessage('error', 'Email và mật khẩu không được để trống');
      }
      else if (!this.formGroup.value.email) {
        this.showMessage('error', 'Email không được để trống');
      }
      else if (!this.formGroup.value.password) {
        this.showMessage('error', 'Mật khẩu không được để trống');
      }
      else {
        this.showMessage('error', 'Email không đúng định dạng');
      }
      return;
    }

    this.authService.login(this.formGroup.value.email, this.formGroup.value.password)
    .pipe(first())
    .subscribe((result: any) => {
      if(result.status_code == 200){
        this.router.navigate(['/']);
      }else{
        this.showMessage('error', "Vui lòng đăng nhập lại");
      }
    }
    );
  }

  showMessage(status: string, message: string) {
    let msg = { severity: status, summary: 'Thông báo', detail: message };
    this.messageService.add(msg);
  }
}
