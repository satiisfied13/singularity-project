import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Product } from "../models/product.interface";
import { Category } from "../models/category.interface";
import { environment } from "../../environments/environment.development";

@Injectable({providedIn: 'root'})

export class StoreService {

    private PRODUCTS = 'products.json'
    private CATEGORIES = 'categories.json'
    private URL = environment.URL;

    constructor(
        private http: HttpClient
    ) {}

    getProducts() {
        return this.http.get<Product>(this.URL + this.PRODUCTS);
    }

    getCategories() {
        return this.http.get<Category>(this.URL + this.CATEGORIES);
    }

    setFavourites(url, data) {
        return this.http.put(url, data);
    }
}