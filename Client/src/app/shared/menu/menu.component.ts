import { Component, OnInit } from '@angular/core';
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
  items: MenuItem[];
  categories!: MegaMenuItem[];

  constructor(private authService: AuthenticationService,
    public router: Router,){
    
  }
  
  ngOnInit() {
    this.items = [
      { label: 'View profile', icon: 'pi pi-users' },
      { label: 'Settings', icon: 'pi pi-fw pi-download' },
      { label: 'Log out', icon: 'pi pi-sign-out', command: () => {
        this.logout()
      }}
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
}
