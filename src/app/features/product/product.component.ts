import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../models/product.interface';
import { CommonModule } from '@angular/common';
import { CartProduct } from '../../models/cart.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit, OnDestroy{

  product: Product;
  products;
  cartProducts: CartProduct[] = [];
  isDescriptionVisible = false; 

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.product = JSON.parse(localStorage.getItem('product'));
    this.cartService.getProducts(this.cartProducts);
    let amountTemp = this.cartProducts.reduce( (a, v) => a + v.amount, 0);
    this.cartService.onNextAmount(amountTemp);
  }

  toggleDescription() {
    this.isDescriptionVisible = !this.isDescriptionVisible;
  }

  onAddToCart() {
    let item = JSON.parse(localStorage.getItem(this.product.name));
    if(JSON.parse(localStorage.getItem(this.product.name))) {
      this.productService.addItemToCart(item, this.product, this.cartProducts, true);
    } else {
      this.productService.addItemToCart(item, this.product, this.cartProducts, false);
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem('product');
  }


}
