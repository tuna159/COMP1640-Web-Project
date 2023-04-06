import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

interface Status {
  label: string;
  value: string;
}
@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent {
  apiUrl: string = "http://localhost:3009/api/user/create-account";

  listStatus = [
    { name: 'Using' },
    { name: 'Not Using' },
  ]

  genders = [
    { name: 'Male'},
    { name: 'Female'},
  ];
  listRole = [ 
    {name: 'Staff', Id: '4'},
    {name: 'Quality Assurance Manager', Id: '2'},
    {name: 'Quality Assurance Coordinator', Id: '3'}
  ]
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
  constructor(private dialogService: DialogService, public ref: DynamicDialogRef, public config: DynamicDialogConfig,
    private http: HttpClient, private authService: AuthenticationService,) {
      this.data = this.config.data;
      // console.log(this.data)
      this.getAllDepartment();
  }
  
  ngOnInit(): void {
    this.getAllDepartment();
    this.formGroup = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      fullName: new FormControl(null, [Validators.required]),
      nickName: new FormControl(null, [Validators.required]),
      gender: new FormControl(null, [Validators.required]),
      role: new FormControl(null, [Validators.required]),
      department: new FormControl(null, [Validators.required]),
      birthday: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
    });

    if(this.data.user_id != null) {
      this.setValueF();
    }
  }

  setValueF() {
    // let departmentValue = this.listDepartments.find(x => x.name == (this.data.is_deleted == 0 ? "Using" : "Not Using"));
    // this.formGroup.controls.status.setValue(departmentValue);
    let statusValue = this.listStatus.find(x => x.name == (this.data.is_deleted == 0 ? "Using" : "Not Using"));
    this.formGroup.controls.status.setValue(statusValue);
    let roleValue = this.listRole.find(x => x.Id == this.data.role.role_id);
    this.formGroup.controls.role.setValue(roleValue);
    this.formGroup.controls.email.setValue("roleValue");

  }

  getAllDepartment() {
    this.http.get<any>("http://localhost:3009/api/department", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      this.listDepartments = res.data;
    })
  
  }

  SaveIdea() {
    if(this.data.user_id == null) {
      let birthdate =""
      if(this.formGroup.controls.birthday.value.getMonth() + 1 <= 9){
        birthdate = this.formGroup.controls.birthday.value.getFullYear() + "-0" + 
        (this.formGroup.controls.birthday.value.getMonth() +1 ) + "-"+ 
        this.formGroup.controls.birthday.value.getDate();
      }else{
        birthdate = this.formGroup.controls.birthday.value.getFullYear() + "-" + 
        this.formGroup.controls.birthday.value.getMonth() + "-"+ 
        this.formGroup.controls.birthday.value.getDate();
      }
      this.http.post(this.apiUrl, {
        "email" : this.formGroup.controls.email.value,
        "password" : this.formGroup.controls.password.value,
        "role_id" : this.formGroup.controls.role.value['Id'],
        "full_name" : this.formGroup.controls.fullName.value,
        "nick_name" : this.formGroup.controls.nickName.value,
        "gender" : this.formGroup.controls.nickName.value,
        "department_id" : this.formGroup.controls.department.value['department_id'],
        "birthdate": birthdate
      }, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((result: any) => {
        console.log(result);
      });
      this.closeDialog()
    } else {
      let data = {
        "role_id" : Number(this.formGroup.controls.role.value['Id']),
        "department_id" : this.formGroup.controls.department.value['department_id'],
        "is_deleted": this.formGroup.controls.status.value['name'] == "Using" ? 0:1
      }
      console.log(data)
      this.http.put("http://localhost:3009/api/user/" + this.data.user_id, {      
        "role_id" : Number(this.formGroup.controls.role.value['Id']),
        "department_id" : this.formGroup.controls.department.value['department_id'],
        "is_deleted": this.formGroup.controls.status.value['name'] == "Using" ? 0:1
      }, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      }).subscribe((result: any) => {
        console.log(result);
      });
      this.closeDialog()
    }
    
  }

  closeDialog() {
    this.ref.close();
  }
}
