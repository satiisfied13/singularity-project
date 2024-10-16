import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { CartProduct } from "../models/cart.interface";

@Injectable({providedIn: 'root'})
export class CartService {
    cartProducts: CartProduct[] = [];
    amountSub = new BehaviorSubject<number>(null);

    constructor(
        private http: HttpClient
    ) {
        this.getProducts(this.cartProducts);
        let amountTemp = this.cartProducts.reduce( (a, v) => a + v.amount, 0);
        this.onNextAmount(amountTemp);
    }

    getProducts(arr: CartProduct[]) {
        for(let i = 0; i < localStorage.length; i++) {
            let arrItem = JSON.parse(localStorage.getItem(localStorage.key(i)));
            if (arrItem.product == localStorage.key(i)) {
                arr.push(arrItem);
            }
        }
    }

    removeProducts() {
        for(let i = 0; i < localStorage.length; i++) {
            let arrItem = JSON.parse(localStorage.getItem(localStorage.key(i)));
            if (arrItem.product == localStorage.key(i)) {
                localStorage.removeItem(arrItem.product);
            }
        }
    }

    onNextAmount(val) {
        this.amountSub.next(val);
    }

    onPushProducts(arr, i, check: boolean) {
        let newAmount = check ? arr[i].amount + 1 : arr[i].amount - 1;
        let temp1 = arr[i].amount == 1 ? arr[i].price : arr[i].price - arr[i].price / arr[i].amount;
        let temp2 = check ? arr[i].price + arr[i].price / arr[i].amount : temp1;
        localStorage.setItem(arr[i].product,
            JSON.stringify(
            {
                product: arr[i].product,
                amount: +newAmount,
                price: +temp2,
                imagePath: arr[i].imagePath,
            })
        );
    }

    buyProducts(url, data) {
        return this.http.put(url, data);
    }
}