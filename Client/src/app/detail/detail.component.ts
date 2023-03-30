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
  role: number;
  selectedNode: any;
  nodes1: any[];
  like: boolean = false;
  dislike: boolean = false;
  listCommentData = [];
  title: string;
  content: string;
  date: any
  user: any
  comment_value: any
  public userArray: any = [];
  apiUrl:string = "http://localhost:3009/api/idea/";
  constructor(private http : HttpClient, private route: ActivatedRoute,private authService: AuthenticationService,
    private router: Router){
    this.Id = this.router.getCurrentNavigation().extras.state.Id;
    this.getIdeaDetail();
    this.getCommentbyIdea();
  }
  getIdeaDetail() {
    if (this.Id) {
      this.http.get<any>(this.apiUrl + this.Id, {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.like = result.data.like;
              this.dislike = result.data.dislike;
              this.title = result.data.title;
              this.user = result.data.user.email;
              this.content = result.data.content;
              this.date = result.data.date;
          });
    }
  }
  //console.log(/[a-z0-9]/i.test(words) );
  getCommentbyIdea(){
    if (this.Id) {
      this.http.get<any>(this.apiUrl + this.Id + "/comments", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((resultComment: any) => {
              this.listCommentData = resultComment.data;
          });
    }
  }

  postCommentByIdea(level: number){
    if(/[a-z0-9]/i.test(this.comment_value) == false)
    {
      alert("Please enter a comment")
    }
    if (this.Id) {
      this.http.post<any>(this.apiUrl + this.Id + "/comments",{
        "content" : this.comment_value,
        "level": level
      }, {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((resultComment: any) => {
              console.log(resultComment)
              console.log(this.Id)
              this.comment_value = ""
              this.getCommentbyIdea()
          });
    }
  }

  ngOnInit(): void {
    this.role = this.authService.getRole();
    // this.nodes1 = [
    //   {
    //     label: 'Category',
    //   },
    //   {
    //     label: 'Category',
    //   },
    //   {
    //     label: 'Category',
    //   },
    //   {
    //     label: 'Category',
    //   },
    //   {
    //     label: 'Category',
    //   },
    //   {
    //     label: 'Category',
    //   },
    //   {
    //     label: 'Category',
    //   },
    // ]
  }
  
  DownloadFile() {
    let thefile: any;
    if (this.Id) {
      this.http.get<any>('http://localhost:3009/api/event/4/download', {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe(data => thefile = new Blob([data], { type: "text/csv" }), //application/octet-stream,
      error => console.log("Error downloading the file."),
      () => {
        let url = window.URL.createObjectURL(thefile);
      window.open(url);
      });
      
    }
    
  }
  ConvertFile(url: string){
    this.http.get('assets/csv.csv', {responseType: 'text'})
    .subscribe(
        data => {
            var hiddenElement = document.createElement('a');
              hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(data);
              hiddenElement.target = '_blank';
              hiddenElement.download = name + '.csv';
              hiddenElement.click();
            // console.log(data);
            // console.log(this.userArray)
        },
        error => {
            console.log(error);
        }
    );
  }
}

export class User{
  name: String;
  age: number;
  city: String;

  constructor(name: String, age : number, city: String){
    this.name = name;
    this.age = age;
    this.city = city;
  }
}
