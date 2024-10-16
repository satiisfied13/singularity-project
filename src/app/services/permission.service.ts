import { inject, Injectable } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { exhaustMap, map, Observable, take, tap } from "rxjs";
import { AuthService } from "./auth.service";
import { AdminService } from "./admin.service";

@Injectable({providedIn: 'root'})

export class PermissionService {
    constructor(
        private authService: AuthService,
        private router: Router,
        private adminService: AdminService
    ) {}

    profilePermission() {
        return this.authService.user.pipe(map(
            (data) => {
                return data ? !!data : this.router.createUrlTree(['/auth']);}
        ))
    }

    adminPermission() {
        return this.adminService.checkIfAdminLogged().pipe(map(
            data => {
                if(this.adminService.checkForUser() && data) {
                    return true;
                } else {
                    return this.router.createUrlTree(['store']);
                }
            }
        ))
    }    
}



export const profileGuard: CanActivateFn = (r, s):
    Observable< boolean | UrlTree > |
    Promise< boolean | UrlTree > |
    boolean |
    UrlTree => {
        return inject(PermissionService).profilePermission();
    }

export const adminGuard: CanActivateFn = (r, s):
    Observable< boolean | UrlTree > |
    Promise< boolean | UrlTree > |
    boolean |
    UrlTree => {
        return inject(PermissionService).adminPermission();
    }