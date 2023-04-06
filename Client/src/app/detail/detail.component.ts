import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})

export class DetailComponent {
  Id: any;
  views: any;
  role: number;
  selectedNode: any;
  nodes1: any[];
  like: boolean = false;
  dislike: boolean = false;
  totalLike: any;
  totalDislike: any;
  listCommentData = [];
  title: string;
  avatar: string;
  content: string;
  anonymous: number
  date: any
  user: any
  listReact: any =[];
  comment_value: any
  totalComment: any;
  commentChildren_value: any;
  public userArray: any = [];
  apiUrl:string = "http://localhost:3009/api/idea/";


  constructor(private http : HttpClient, private route: ActivatedRoute,private authService: AuthenticationService,
    private router: Router){
    this.Id = this.router.getCurrentNavigation().extras.state.Id;
    this.getIdeaDetail();
    this.getCountIdeaComment();
    this.getLikeIdea();
    this.getDislikeIdea();
    this.getCommentbyIdea();
    this.getListReaction();
  }

  getListReaction() {
    if (this.Id) {
      this.http.get<any>("http://localhost:3009/api/idea/" + this.Id + "/list-reaction", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.listReact = result.data;
              if(this.listReact.map(x => x.user_id).includes(this.authService.getUserID()) == true) {
                if(this.listReact.find(x => x.user_id == this.authService.getUserID()).reaction_type == 1) {
                  this.like = true;
                  this.dislike = false;
                } else {
                  this.like = false;
                  this.dislike = true;
                }
              }
          });
    }
  }
  class="p-ripple p-element p-button p-togglebutton p-component p-highlight"
  getLikeIdea() {
    if (this.Id) {
      this.http.get<any>("http://localhost:3009/api/idea/" + this.Id + "/likes", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.totalLike = result.data.likes;
          });
    }
  }
  getDislikeIdea() {
    if (this.Id) {
      this.http.get<any>("http://localhost:3009/api/idea/" + this.Id + "/dislikes", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.totalDislike = result.data.dislikes;
          });
    }
  }

  getCountIdeaComment() {
    if (this.Id) {
      this.http.get<any>("http://localhost:3009/api/idea/" + this.Id + "/comments/total", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.totalComment = result.data.comments;
          });
    }
  }

  getIdeaDetail() {
    if (this.Id) {
      this.http.get<any>(this.apiUrl + this.Id, {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
        console.log("result", result.data);
        
              this.title = result.data.title;
              this.views = result.data.views;
              this.user = result.data.user.nick_name;
              this.content = result.data.content;
              this.date = result.data.date;
              this.avatar = result.data.avatar_url;
              this.anonymous = result.data.is_anonymous;
          });
    }
  }
  //console.log(/[a-z0-9]/i.test(words) );
  getCommentbyIdea(){
    if (this.Id) {
      this.http.get<any>(this.apiUrl + this.Id + "/comments", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((resultComment: any) => {
              let listAllCmtChildren = []
              let listCmtChildren = []
              this.listCommentData = resultComment.data;
              //list comment cha
              this.listCommentData = this.listCommentData.filter(x => x.level == 1)
              //list comment con
              listAllCmtChildren = resultComment.data.filter(x => x.level == 2)
              this.listCommentData.forEach(cmt => {
                //filter tìm parent_id = comment_id để push vào listCommentData
                listCmtChildren = listAllCmtChildren.filter(x => x.parent_id == cmt.comment_id)
                cmt.listCommentChildren = listCmtChildren;
              });
          });
    }
  }

  postCommentByIdea(idParent: number){
    if(idParent == null) {
      if(/[a-z0-9]/i.test(this.comment_value) == false)
      {
        alert("Please enter a comment")
      }
    } else {
      if(/[a-z0-9]/i.test(this.commentChildren_value) == false)
      {
        alert("Please enter a comment")
      }
    }
    if (this.Id) {
      this.http.post<any>(this.apiUrl + this.Id + "/comments",{
        "content" : this.comment_value == null ? this.commentChildren_value : this.comment_value,
        "parent_id": idParent
      }, {headers: {Authorization: 'Bearer ' + this.authService.getToken()}}).subscribe((resultComment: any) => {
            this.comment_value = ""
            this.commentChildren_value = ""
            this.getCountIdeaComment();
            this.getCommentbyIdea();
      });
    }
  }

  ngOnInit(): void {
    this.role = this.authService.getRole();
  }
  
  dislikeIdeal() {
    if (this.Id && this.dislike == true) {
      this.http.post<any>("http://localhost:3009/api/idea/" + this.Id +"/reaction", {
        "reaction": -1
      },{headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.dislike = true
              this.like = false
              this.getDislikeIdea()
              this.getLikeIdea()
          });
    } else {
      console.log("dislike")
      this.http.delete<any>("http://localhost:3009/api/idea/" + this.Id +"/reaction", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.dislike = false
              this.like = false
              this.getDislikeIdea()
              this.getLikeIdea()
          });
    }
  }
  likeIdeal() {
    if (this.Id && this.like == true) {
      this.http.post<any>("http://localhost:3009/api/idea/" + this.Id +"/reaction", {
        "reaction": 1
      },{headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.like = true
              this.dislike = false
              this.getDislikeIdea()
              this.getLikeIdea()
          });
    } else {
      this.http.delete<any>("http://localhost:3009/api/idea/" + this.Id +"/reaction", {headers: {
        Authorization: 'Bearer ' + this.authService.getToken()}
      }).subscribe((result: any) => {
              this.like = false
              this.dislike = false
              this.getDislikeIdea()
              this.getLikeIdea()
          });
    }
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
