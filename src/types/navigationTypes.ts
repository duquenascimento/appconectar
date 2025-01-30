// src/types/navigationTypes.ts
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
    Sign: undefined;
    Products: undefined;
    Cart: undefined;
    Prices: undefined;
    Confirm: undefined;
    FinalConfirm: undefined;
    Register: undefined;
    RegisterFinished: undefined;
    Orders: undefined;
    OrderDetails: { orderId: string }; 
};


export type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;