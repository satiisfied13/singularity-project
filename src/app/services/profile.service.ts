import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserData } from "../models/userData.interface";

@Injectable({providedIn: 'root'})
export class ProfileService {
    constructor(
        private http: HttpClient,
    
    ) {}

    getUserData(url) {
        return this.http.get<UserData>(url);
    }

    addName(url, data) {
        return this.http.put(url, data);
    }
}