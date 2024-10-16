export interface CartProduct {
    product: string;
    amount: number;
    price: number;
    imagePath?: string;
    purchaseDate?: Date;
}