export type QuotationResquestBody = {
    restaurantId: string;
    deliveryDate: string;
    products?: {
        sku: string;
        quantity: number;
        observation?: string | null;
    }[];
}
