export interface RestaurantDeliveryPolicy {
    canCreateSundayOrders: boolean;
}

export interface Restaurant {
    externalId: string;
    id: string;
    name: string;
    addressInfos: any[];
    premium: boolean;
    registrationReleasedNewApp: boolean;
    conectarPlusAuthorization: boolean;
    deliveryPolicy: RestaurantDeliveryPolicy;
    allowClosedSupplier: boolean;
    allowMinimumOrder: boolean;
}