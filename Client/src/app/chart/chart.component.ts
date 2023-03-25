import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent {
  menus: MenuItem[] = [];

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
}
