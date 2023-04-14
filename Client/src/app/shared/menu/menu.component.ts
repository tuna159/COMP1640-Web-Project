import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MegaMenuItem } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
interface Country {
  name: string;
  code: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  display: any;
  value3: any;
  dataUser: any;
  role: number;
  items: MenuItem[];
  itemsAdmin: MenuItem[];
  categoryDialog: boolean;
  itemsQA: MenuItem[];
  itemsQAM: MenuItem[];
  categories!: MegaMenuItem[];
  listCategories = [];
  formGroup: FormGroup<{
    category: FormControl<number>;
  }>;
  constructor(
    private authService: AuthenticationService,
    private http: HttpClient,
    public router: Router
  ) {
    this.role = authService.getRole();
    this.getDataUser();
    this.role = this.authService.getRole();
    this.getListCategory();
  }
  getDataUser() {
    if (this.authService.getRole() != 1) {
      this.http
        .get<any>(
          'http://52.199.43.174:3009/api/user/' + this.authService.getUserID(),
          {
            headers: {
              Authorization: 'Bearer ' + this.authService.getToken(),
            },
          }
        )
        .subscribe((result: any) => {
          this.dataUser = result.data;
        });
    }
  }

  getListCategory() {
    this.http
      .get<any>('http://52.199.43.174:3009/api/category', {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((res: any) => {
        this.listCategories = res.data;
      });
  }

  ngOnInit() {}

  isLinkActive(link) {
    const url = this.router.url;
    return link.id === url.substring(1, url.indexOf('?'));
  }
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
