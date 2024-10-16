import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, takeLast} from 'rxjs';
import { CartProduct } from '../../models/cart.interface';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy{

  isLogged = false;
  private userSub: Subscription;
  cartProducts: CartProduct[] = [];
  amount: number;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(){
    this.userSub = this.authService.user.subscribe(
      data => {
        this.isLogged = !!data;
      }
    );
    this.authService.autoLogin();
    this.userSub = this.cartService.amountSub.subscribe( data => {
        this.amount = data;
      }
    );
  }

  ngOnDestroy(){
    this.userSub.unsubscribe();
  }
  

}
