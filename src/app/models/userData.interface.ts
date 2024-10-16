import { CartProduct } from "./cart.interface";


export interface UserData {
    email: string;
    name: string;
    purchases: CartProduct[];
    key?: string;
}