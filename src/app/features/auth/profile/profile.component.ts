import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../models/user.model';
import { map, Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';
import { UserData } from '../../../models/userData.interface';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy{

  nameForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })
  isNameSettingMode = false;
  isNameSet = false;
  userSub: Subscription;
  isLogged = false;
  user: User;
  isAdmin = false;
  userData: UserData;
  isLoading = false;

  URL = environment.URL;

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService,
    private profileService: ProfileService
  ){}

  ngOnInit(): void {
    this.isLoading = true;
    this.user = JSON.parse(localStorage.getItem('user'));
    this.userSub = this.authService.user.subscribe(
      data => {
        this.isLogged = !!data;
      }
    );
    this.adminService.isAdmin.subscribe( data => {
      this.isAdmin = data;
    });
    this.profileService.getUserData(this.URL + this.user.id + '.json').pipe(
      map( data => {
        for(let key in data) {
          this.userData = {...data[key], key: key};
        }
      })
    ).subscribe( () => {
      this.isLoading = false;
    });
  }

  onLogout() {
    if(!this.isLogged) {
      return;
    }
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  addName() {
    this.nameForm.reset();
    this.isNameSettingMode = !this.isNameSettingMode;
  }

  onAddName() {
    this.profileService.addName(this.URL + this.user.id + '/' + this.userData.key + '.json',
      {
        email: this.userData.email,
        name: this.nameForm.value.name,
        purchases: this.userData.purchases
      }).subscribe( data => {
        this.isLoading = true;
        this.profileService.getUserData(this.URL + this.user.id + '.json').pipe(
          map( data => {
            for(let key in data) {
              this.userData = {...data[key], key: key};
            }
          })
        ).subscribe( () => {
          this.isLoading = false;
        });
      });
  }

  ngOnDestroy(){
    this.userSub.unsubscribe();
  }
}
