import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Product } from "../models/product.interface";
import { environment } from "../../environments/environment.development";

export interface AdminLoggedData {
    key: boolean;
}

@Injectable({providedIn: 'root'})

export class AdminService {

    isAdmin = new BehaviorSubject<boolean>(false);
    isAdminLogged = new BehaviorSubject<boolean>(false);
    private IS_ADMIN_LOGGED = 'isAdminLogged.json';
    private PRODUCTS = 'products.json';
    private CATEGORIES = 'categories.json';
    private URL = environment.URL;

    constructor(
        private http: HttpClient
    ){}

    checkIfAdmin() {
        return this.http.get<string>(this.URL + 'admin.json');
    }

    checkIfAdminLogged() {
        return this.http.get<AdminLoggedData>(this.URL + this.IS_ADMIN_LOGGED);
    }

    setAdminLogged(v: boolean) {
        return this.http.put(this.URL + this.IS_ADMIN_LOGGED, v);
    }

    checkForUser() {
        for(let i = 0; i < localStorage.length; i++) {
            if(localStorage.key(i) == 'user') {
                return true;
            } 
        }
        return false;
    }

    deleteProduct(key) {
        return this.http.delete(this.URL + 'products' + '/' + key + '.json');
    }

    setProduct(product) {
        return this.http.post(this.URL + this.PRODUCTS, {...product});
    }

    deleteCategory(key) {
        return this.http.delete(this.URL + 'categories' + '/' + key + '.json');
    }

    setCategory(category) {
        return this.http.post(this.URL + this.CATEGORIES, category);
    }
}