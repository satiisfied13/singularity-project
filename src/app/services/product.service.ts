import { Injectable } from "@angular/core";
import { CartService } from "./cart.service";

@Injectable({providedIn: 'root'})

export class ProductService {
    constructor(
        private cartService: CartService
    ) {}

    addItemToCart(item, product, arr, check: boolean) {
        localStorage.setItem(product.name, 
            JSON.stringify(
                {
                    product: product.name, 
                    amount: check ? +item.amount + 1 : 1, 
                    price: check ? +product.price * +(item.amount + 1) : +product.price,
                    imagePath: product.image
                }));
            arr = [];
            this.cartService.getProducts(arr);
            let amountTemp = arr.reduce( (a, v) => a + v.amount, 0);
            this.cartService.onNextAmount(amountTemp);
    }
}