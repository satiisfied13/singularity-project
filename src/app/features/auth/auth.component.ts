import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../core/navbar/navbar.component';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})

export class AuthComponent {

  URL_FOR_LOGIN = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
  URL_FOR_SIGNUP = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
  URL = environment.URL;

  isLoading = false;
  isLoginMode = true;
  error;

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  })

  constructor (
    private authService: AuthService,
    private router: Router
  ){}

  onAuth() {
    if(!this.isLoginMode) {
      this.isLoading = true;
      this.authService.authRequest(
        this.authForm.value.email,
        this.authForm.value.password, 
        this.URL_FOR_SIGNUP
      ).subscribe(
        data => {
          this.isLoading = false;
          this.authService.addUserData(this.URL + JSON.parse(localStorage.getItem('user')).id + '.json', {
            email: this.authForm.value.email,
            name: '',
            purchases: '',
            favoured: ''
          }).subscribe();
          this.error = '';
          this.router.navigate(['store']);
        },
        error => {
          this.error = error;
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = true;
      this.authService.authRequest(
        this.authForm.value.email,
        this.authForm.value.password, 
        this.URL_FOR_LOGIN
      ).subscribe(
        data => {
          this.isLoading = false;
          this.error = '';
          this.router.navigate(['store']);
        },
        error => {
          this.error = error;
          this.isLoading = false;
        }
      );
    }
  }

  onSwitch() {
    this.isLoginMode = !this.isLoginMode;
  }
}
