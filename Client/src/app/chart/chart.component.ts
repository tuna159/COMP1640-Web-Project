import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent {
  menus: MenuItem[] = [];
  constructor(private authService: AuthenticationService, private http : HttpClient,
    public router: Router, ){
  }
  ngOnInit() {
    this.menus = [
      {
        label: 'chart 1'
      },
      {
        label: 'chart 2'
      },
      {
        label: 'chart 3'
      },
      {
        label: 'chart 4'
      }
    ]
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login')
  }
}
