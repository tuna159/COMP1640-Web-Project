import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../auth/services/authentication.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent {
  Id: any;
  selectedNode: any;
  nodes1: any[];
  like: boolean = false;
  dislike: boolean = false;
  comment_value: string;
  title: string;
  content: string;
  date: any
  apiUrl:string = "http://localhost:3009/api/idea/";
  constructor(private http : HttpClient, private route: ActivatedRoute,private authService: AuthenticationService,
    private router: Router){
    this.Id = this.router.getCurrentNavigation().extras.state.Id;
    this.getIdeaDetail();
  }
  getIdeaDetail(){
    if (this.Id) {
      this.http.get<any>(this.apiUrl + this.Id, {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.like = result.data.like;
              this.dislike = result.data.dislike;
              this.comment_value = result.data.title;
              this.title = result.data.title;
              this.content = result.data.content;
              this.date = result.data.date;
          });
  }
  }
  ngOnInit(): void {
    this.nodes1 = [
      {
        label: 'Category',
      },
      {
        label: 'Category',
      },
      {
        label: 'Category',
      },
      {
        label: 'Category',
      },
      {
        label: 'Category',
      },
      {
        label: 'Category',
      },
      {
        label: 'Category',
      },
    ]
  }
}
