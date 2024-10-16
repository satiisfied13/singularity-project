import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, tap, throwError } from "rxjs";

import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { AdminService } from "./admin.service";
import { environment } from "../../environments/environment.development";


export interface AuthResponse {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    user = new BehaviorSubject<User>(null);
    tokenExpirationTimer: any = null;
    
    API_KEY = environment.API_KEY;

    constructor(
        private http: HttpClient,
        private route: Router,
        private adminService: AdminService
    ) {
    }

    authRequest(email: string, password: string, URL) {
        return this.http.post<AuthResponse>(
            URL + this.API_KEY,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }).pipe(
                tap(
                    responseData => {
                        const expireDate = new Date(new Date().getTime() + +responseData.expiresIn * 1000);
                        const user = new User(
                            responseData.email, 
                            responseData.localId, 
                            responseData.idToken, 
                            expireDate);
                        const expDur = 
                            new Date(expireDate).getTime() - 
                            new Date().getTime();
                        this.adminService.checkIfAdmin().subscribe(
                            data => {
                                if(responseData.email == data) {
                                    this.adminService.isAdmin.next(true);
                                    this.adminService.setAdminLogged(true).subscribe();
                                } else {
                                    this.adminService.isAdmin.next(false);
                                }
                            }
                        );
                        this.user.next(user);
                        this.autoLogout(expDur);
                        localStorage.setItem('user', JSON.stringify(user));
                        this.route.navigate(['']);
                    }
                ),
                catchError( 
                    error => {
                        let errorMes = 'An unknown error occured!';
                        if(!error.error || !error.error.error) {
                            return throwError(() => errorMes);
                        }
                        switch(error.error.error.message){
                            case 'EMAIL_EXISTS':
                                errorMes = 'Email already exists!';
                                break;
                            case 'OPERATION_NOT_ALLOWED':
                                errorMes = 'Try again later!';
                                break;
                            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                                errorMes = 'Too many attempts. Try again later!';
                                break;
                            case 'INVALID_LOGIN_CREDENTIALS':
                                errorMes = 'Invalid password or email!';
                                break;
                            case 'USER_DISABLED':
                                errorMes = 'Your account has been disabled by an administrator!';
                                break;
                        }
                        return throwError(() => errorMes);
                    }
                )
            );
    }

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: Date;
        } = JSON.parse(localStorage.getItem('user'));

        if(!userData) {
            return;
        }

        const loadedUser: User = new User(
            userData.email, 
            userData.id, 
            userData._token, 
            new Date(userData._tokenExpirationDate));
        if(loadedUser.token) {
            this.user.next(loadedUser);
            const expDur = 
                new Date(userData._tokenExpirationDate).getTime() - 
                new Date().getTime();
            this.autoLogout(expDur);
        }

        this.adminService.checkIfAdminLogged().subscribe( data => {
            let user = JSON.parse(localStorage.getItem('user'));
            this.adminService.checkIfAdmin().subscribe( admin => {
                    data && user.email == admin ?
                    this.adminService.isAdmin.next(true) :
                    this.adminService.isAdmin.next(false); 
                }
            );
        });

        this.route.navigate(['']);
    }

    autoLogout(expDur: number) {
        this.tokenExpirationTimer = setTimeout( () => {
            this.logout();
        }, expDur);
    }

    logout() {
        this.adminService.isAdmin.next(false);
        this.adminService.setAdminLogged(false).subscribe();
        this.user.next(null);
        localStorage.removeItem('user');
        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
        this.route.navigate(['/auth']);
    }

    addUserData(url, data) {
        return this.http.post(url, data);
    }

}