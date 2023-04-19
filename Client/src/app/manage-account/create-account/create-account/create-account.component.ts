import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
})
export class CreateAccountComponent {
  apiUrl: string = 'http://localhost:3009/api/user/create-account';

  listStatus = [{ name: 'Using' }, { name: 'Not Using' }];

  genders = [{ name: 'Male' }, { name: 'Female' }];
  listRole = [
    { name: 'Staff', Id: 4 },
    { name: 'Quality Assurance Manager', Id: 2 },
    { name: 'Quality Assurance Coordinator', Id: 3 },
  ];
  listDepartments = [];
  formGroup: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    fullName: FormControl<string>;
    nickName: FormControl<string>;
    role: FormControl<any>;
    gender: FormControl<any>;
    birthday: FormControl<Date>;
    department: FormControl<any>;
    status: FormControl<any>;
  }>;
  data: any;
  value: any;
  constructor(
    private dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private http: HttpClient,
    private authService: AuthenticationService,
    private messageService: MessageService
  ) {
    this.data = this.config.data;
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
      ]),
      password: new FormControl(null, [Validators.required]),
      fullName: new FormControl(null, [
        Validators.required,
        Validators.pattern('[a-zA-Z ]*'),
      ]),
      nickName: new FormControl(null, [Validators.required]),
      gender: new FormControl({ name: 'Female' }, [Validators.required]),
      role: new FormControl(
        this.listRole.find((x) => x.Id == 4),
        [Validators.required]
      ),
      department: new FormControl(null, [Validators.required]),
      birthday: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
    });
    this.changeRole();

    if (this.data.user_id != null) {
      this.setValueF();
    }
  }

  setValueF() {
    let statusValue = this.listStatus.find(
      (x) => x.name == (this.data.is_deleted == 0 ? 'Using' : 'Not Using')
    );
    this.formGroup.controls.status.setValue(statusValue);
    let roleValue = this.listRole.find((x) => x.Id == this.data.role.role_id);
    this.formGroup.controls.role.setValue(roleValue);
  }

  getAllDepartment() {
    this.http
      .get<any>('http://localhost:3009/api/department', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((res: any) => {
        this.listDepartments = res.data;
      });
  }

  changeRole() {
    if (this.formGroup.controls.role.value['Id'] == 4) {
      this.http
        .get<any>('http://localhost:3009/api/department', {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        })
        .subscribe((res: any) => {
          this.listDepartments = res.data;
        });
    } else if (this.formGroup.controls.role.value['Id'] == 3) {
      this.http
        .get<any>('http://localhost:3009/api/department/available', {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        })
        .subscribe((res: any) => {
          this.listDepartments = res.data;
        });
    } else {
      this.listDepartments = [];
    }
  }

  SaveAccount() {
    if (this.data.user_id == null) {
      if (
        this.formGroup.controls.birthday.value &&
        this.formGroup.controls.birthday.value.getTime() > Date.now()
      ) {
        this.showMessage('error', 'birthday must less than current date ');
        return;
      }
      if (this.formGroup.controls.birthday.value == null) {
        this.showMessage('error', 'Please enter your birthday');
        return;
      }
      let birthdate = '';
      if (this.formGroup.controls.birthday.value.getMonth() + 1 <= 9) {
        birthdate =
          this.formGroup.controls.birthday.value.getFullYear() +
          '-0' +
          (this.formGroup.controls.birthday.value.getMonth() + 1) +
          '-' +
          (this.formGroup.controls.birthday.value.getDate() < 10
            ? '0' + this.formGroup.controls.birthday.value.getDate()
            : this.formGroup.controls.birthday.value.getDate());
      } else {
        birthdate =
          this.formGroup.controls.birthday.value.getFullYear() +
          '-' +
          this.formGroup.controls.birthday.value.getMonth() +
          '-' +
          (this.formGroup.controls.birthday.value.getDate() < 10
            ? '0' + this.formGroup.controls.birthday.value.getDate()
            : this.formGroup.controls.birthday.value.getDate());
      }
      let bodyData = {
        email: this.formGroup.controls.email.value,
        password: this.formGroup.controls.password.value,
        role_id: this.formGroup.controls.role.value['Id'],
        full_name: this.formGroup.controls.fullName.value,
        nick_name: this.formGroup.controls.nickName.value,
        gender: this.formGroup.controls.gender.value['name'] == 'Male' ? 1 : 2,
        department_id:
          this.formGroup.controls.department.value != null
            ? this.formGroup.controls.department.value['department_id']
            : 1,
        birthdate: birthdate,
      };
      this.http
        .post(this.apiUrl, bodyData, {
          headers: {
            Authorization: 'Bearer ' + this.authService.getToken(),
          },
        })
        .subscribe(
          (result: any) => {
            this.closeDialog();
          },
          (err) => {
            this.showMessage('error', err.error.message);
            return;
          }
        );
    } else {
      this.http
        .put(
          'http://localhost:3009/api/user/' + this.data.user_id,
          {
            role_id: Number(this.formGroup.controls.role.value['Id']),
            department_id:
              this.formGroup.controls.department.value != null
                ? this.formGroup.controls.department.value['department_id']
                : 1,
            is_deleted:
              this.formGroup.controls.status.value['name'] == 'Using' ? 0 : 1,
          },
          {
            headers: {
              Authorization: 'Bearer ' + this.authService.getToken(),
            },
          }
        )
        .subscribe(
          (result: any) => {
            this.closeDialog();
          },
          (err) => {
            this.showMessage('error', err.error.message);
            return;
          }
        );
    }
  }

  closeDialog() {
    this.ref.close();
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Notification:',
      detail: detail,
    });
  }
}
