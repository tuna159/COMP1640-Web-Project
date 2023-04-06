import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MegaMenuItem } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
interface Country {
  name: string,
  code: string
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  display: any;
  value3: any;
  dataUser: any;
  role: number;
  items: MenuItem[];
  itemsAdmin: MenuItem[];
  downloadEvent: boolean;
  itemsQA: MenuItem[];
  itemsQAM: MenuItem[];
  categories!: MegaMenuItem[];
  formGroup: FormGroup<{
    name: FormControl<string>;
    department: FormControl<string>;
    startDate: FormControl<Date>;
    endDate: FormControl<Date>;
  }>;
  constructor(private authService: AuthenticationService, private http : HttpClient,
    public router: Router, ){
      this.role = authService.getRole();
    this.getDataUser(); 
    this.role = this.authService.getRole()
  }
  getDataUser() {
    if(this.authService.getRole() != 1) {
      this.http.get<any>("http://localhost:3009/api/user/" + this.authService.getUserID(), {headers: {
      Authorization: 'Bearer ' + this.authService.getToken()}
    }).subscribe((result: any) => {
            this.dataUser = result.data;
        });
    }
  }
  
  ngOnInit() {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      department: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
    });
    

    this.items = [
      { label: 'View profile', icon: 'pi pi-users', routerLink: '/view/profile' },
      { label: 'Settings', icon: 'pi pi-fw pi-download' },
      { label: 'Log out', icon: 'pi pi-sign-out', command: () => {
        this.logout()
      }}
    ];

    this.itemsAdmin = [
      // { label: 'View profile', icon: 'pi pi-users', routerLink: '/view/profile' },
      { label: 'Manage Account', icon: 'pi pi-fw pi-download' },
      { label: 'Manage Event', icon: 'pi pi-fw pi-download' },
      {
        label: 'Log out', icon: 'pi pi-sign-out', command: () => {
          this.logout()
        }
      }
    ];

    this.itemsQA = [
      // { label: 'View profile', icon: 'pi pi-users', routerLink: '/view/profile' },
      { label: 'Manage Category', icon: 'pi pi-fw pi-download' },
      {
        label: 'Log out', icon: 'pi pi-sign-out', command: () => {
          this.logout()
        }
      }
    ];

    this.categories = [
      {
        label: 'Categories', icon: 'pi pi-list',
        items: [
          [
            {

              items: [{ label: 'Video 1.1' }, { label: 'Video 1.2' }, { label: 'Video 1.3' }, { label: 'Video 1.4' }]
            },
          ],
          [
            {

              items: [{ label: 'Video 3.1' }, { label: 'Video 3.2' }, { label: 'Video 3.2' }, { label: 'Video 3.2' }]
            },
          ],
          [
            {

              items: [{ label: 'Video 3.1' }, { label: 'Video 3.2' }, { label: 'Video 3.2' }, { label: 'Video 3.2' }]
            },
          ],
          [
            {

              items: [{ label: 'Video 3.1' }, { label: 'Video 3.2' }, { label: 'Video 3.2' }, { label: 'Video 3.2' }]
            },
          ]
        ]
      },
    ]
  }
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login')
  }

  showDialogDownload() {
    this.downloadEvent = true;
  }
}
