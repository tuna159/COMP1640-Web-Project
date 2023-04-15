import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
    private userSubject: BehaviorSubject<any>;
    //, bạn tạo một Observable phiên bản xác định chức năng người đăng ký
    //Observable: “lắng nghe” các thay đổi trạng thái do các hàm ( next(), error() và complete()) observable phát ra.
    public user: Observable<any>;
    public Roles = [];
    constructor(private http: HttpClient, private router: Router) {
        this.userSubject = new BehaviorSubject<any>(
            JSON.parse(localStorage.getItem('user'))
        );
        this.user = this.userSubject.asObservable();
    }

  public setUser(value): any {
    this.userSubject.next(value);
  }

  public getUser(): any {
    return this.userSubject.value;
  }

  public getToken(): any {
    if (!this.userSubject.value.data) {
      localStorage.removeItem('user');
    }
    return this.userSubject.value.data.token;
  }

  public getUserID(): any {
    if (!this.userSubject.value.data) {
      localStorage.removeItem('user');
    }
    return this.userSubject.value.data.user_id;
  }

  public getRole() {
    if (!this.userSubject.value.data) {
      localStorage.removeItem('user');
    }
    const tokenInfo = this.getDecodedAccessToken(
      this.userSubject.value.data.token
    ); // decode token

    return tokenInfo.role_id;
  }

  public getDepartment() {
    if (!this.userSubject.value.data) {
      localStorage.removeItem('user');
    }
    const tokenInfo = this.getDecodedAccessToken(
      this.userSubject.value.data.token
    ); // decode token

    return tokenInfo.deparment_id;
  }

  public getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  public login(username: string, password: string) {
    return this.http
      .post<any>('http://52.199.43.174:3009/api/user/login', {
        email: username,
        password: password,
      })
      .pipe(
        map((user) => {
          // store user details jwt token in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          this.setUser(user);
          console.log(this.userSubject.value.data.token);
          this.userSubject.next(user);
          return user;
        })
      );
  }

  public logout() {
    //remove user from localStorage
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }
}
