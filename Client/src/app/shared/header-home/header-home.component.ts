import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';


@Component({
  selector: 'app-header-home',
  templateUrl: './header-home.component.html',
  styleUrls: ['./header-home.component.css']
})
export class HeaderHomeComponent {
  menus: MenuItem[] = [];
  listDepartment = [];
  constructor(private http: HttpClient,
    private authService: AuthenticationService, private router: Router) { }
  ngOnInit() {
    this.getAllDepartment();
  }

  getAllDepartment() {
    this.http.get<any>("http://localhost:3009/api/department", {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }).subscribe((res: any) => {
      if (res.status_code != 200) {
        return;
      }
      this.listDepartment = res.data;
      // for (let i = 0; i < this.listDepartment.length; i++) {
      //   let item: MenuItem = {
      //     label: this.listDepartment[i].name,
      //     routerLink: "/event/ideas",
      //     state: {Id: this.listDepartment[i].department_id},

      //     queryParams: { Id: this.listDepartment[i].department_id } ,
      //     routerLinkActiveOptions: true
      //   }
      //   items.push(item);
      // }
      // this.menus = items;
    })
  }
  isLinkActive(link) {
    const url = this.router.url;
    return link.id === url.substring(1, url.indexOf('?'));
  }
}


