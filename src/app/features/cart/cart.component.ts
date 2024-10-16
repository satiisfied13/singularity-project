import { Component, OnInit } from '@angular/core';
import { CartProduct } from '../../models/cart.interface';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { User } from '../../models/user.model';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserData } from '../../models/userData.interface';
import { CartService } from '../../services/cart.service';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit{

  cartProducts: CartProduct[] = [];
  isLoading = false;
  isLoading2 = false;
  isPurchased = false;
  userData: UserData;
  user: User;
  isBought = false;
  error = '';
  URL =environment.URL;
  purchaseId;

  constructor(private cartService: CartService,
    private profileService: ProfileService
  ){}

  buyForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', Validators.required),
    cardNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9 ]{19}$')]),
    cardExpDate: new FormControl('', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$')]),
    cardCVV: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{3,4}$')])
  })

  fullPrice: number = 0;
  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.cartService.getProducts(this.cartProducts);
    this.fullPrice = this.cartProducts.reduce( (a, v) => a + +v.price, 0);
    let amountTemp = this.cartProducts.reduce( (a, v) => a + +v.amount, 0);
    this.cartService.onNextAmount(amountTemp);
    if(this.user) {
      this.profileService.getUserData(this.URL + this.user.id + '.json').pipe(
        map( data => {
          for(let key in data) {
            this.userData = {...data[key], key: key};
          }
      })
      ).subscribe( () => {});
    }
  }

  onDelete(i) {
    localStorage.removeItem(this.cartProducts[i].product);
    this.cartProducts.splice(i, 1);
    this.fullPrice = this.cartProducts.reduce( (a, v) => a + +v.price, 0);
    let amountTemp = this.cartProducts.reduce( (a, v) => a + +v.amount, 0);
    this.cartService.onNextAmount(amountTemp);
  }

  onAdd(i) {
    this.cartService.onPushProducts(this.cartProducts, i, true);
    this.cartProducts = [];
    this.cartService.getProducts(this.cartProducts);
    this.fullPrice = this.cartProducts.reduce( (a, v) => a + +v.price, 0);
    let amountTemp = this.cartProducts.reduce( (a, v) => a + +v.amount, 0);
    this.cartService.onNextAmount(amountTemp);
  }

  onRemove(i) {
    if (this.cartProducts[i].amount != 1) {
      this.cartService.onPushProducts(this.cartProducts, i, false);
      this.cartProducts = [];
      this.cartService.getProducts(this.cartProducts);
      this.fullPrice = this.cartProducts.reduce( (a, v) => a + +v.price, 0);
      let amountTemp = this.cartProducts.reduce( (a, v) => a + +v.amount, 0);
      this.cartService.onNextAmount(amountTemp);
    } else {
      return;
    }
  }

  onPopUp() {
    this.isBought = true;
  }

  onClosePopUp() {
    this.isBought = false;
    this.isPurchased = false;
    this.error = '';
    this.purchaseId = '';
  }

  onBuy() {
    this.error = '';
    this.purchaseId = '';
    if(this.user) {
      if(this.buyForm.valid) {
        this.isLoading2 = true;
        this.isPurchased = true;
        this.cartProducts.map( v => v.purchaseDate = new Date(Date.now()));
        this.cartService.buyProducts(
        this.URL + this.user.id + '/' + this.userData.key + '.json',
        {
          email: this.userData.email,
          name: this.userData.name,
          purchases: !this.userData.purchases.length ? [...this.cartProducts] : [...this.cartProducts].concat([...this.userData.purchases]),
        }
        ).subscribe( () => {
        this.cartService.removeProducts();
        this.cartProducts = [];
        this.cartService.amountSub.next(0);
        this.purchaseId = this.generateRandomId();
        this.isLoading2 = false;
        });
      } else {
        this.error = 'Some data is incorrect!'
      }
    } else {
      this.error = 'You are not registered!'
      return;
    }
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
    if (value.length > 16) {
      value = value.slice(0, 16); 
    }
    input.value = value.replace(/(.{4})/g, '$1 ').trim(); 
    this.buyForm.get('cardNumber')?.setValue(input.value);
  }

  formatExpiryDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
    if (event instanceof InputEvent && event.inputType === 'deleteContentBackward' && value.length === 2) {
      value = value.slice(0, 1); 
    }
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    input.value = value;
    this.buyForm.get('cardExpDate')?.setValue(input.value);
  }

  private generateRandomId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }
}
