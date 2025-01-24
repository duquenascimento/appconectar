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
    OrderDetails: { orderId: string }; // Adicione a rota OrderDetails com o parâmetro orderId
};

// Tipos para as props de navegação
export type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;