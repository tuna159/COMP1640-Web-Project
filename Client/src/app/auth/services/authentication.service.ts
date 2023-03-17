import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private userSubject: BehaviorSubject<any>;
    public user: Observable<any>;

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
        return this.userSubject.value.data.token;
    }
    public getUserID(): any {
        return this.userSubject.value.data.user_id;
    }

    public login(username: string, password: string) {
        return this.http.post<any>('http://localhost:3009/api/user/login', { "email": username,"password": password }).pipe(
            map((user) => {
                // store user details jwt token in localStorage
                localStorage.setItem('user', JSON.stringify(user));
                this.setUser(user)
                console.log(this.userSubject.value.data.token)
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
