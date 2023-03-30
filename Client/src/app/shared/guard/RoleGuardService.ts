// src/app/auth/role-guard.service.ts
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "../../auth/services/authentication.service";

@Injectable()
export class RoleGuardService implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthenticationService,
        ) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        // this will be passed from the route config
        // on the data property
        
        const expectedRole = route.data.expectedRole;
        console.log(expectedRole)
        console.log(expectedRole.includes(this.authService.getRole()))
        // decode the token to get its payload
        if (
            !this.authService.getUser() ||
            // this.authService.getRole() !== expectedRole
            expectedRole.includes(this.authService.getRole())== false
        ) {
            alert("bạn không đủ trình để truy cập")
            this.router.navigate(['/home']);
            return false;
        }
        return true;
    }
}