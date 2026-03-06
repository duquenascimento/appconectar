import { DateTime } from "luxon";

export interface PaymentDescriptions {
  [key: string]: string;
}

export interface PaymentDateData {
  [key: string]: DateTime;
}

export interface CreateCreditCardDto {
  restaurantId: string;
  nickname: string;
  isDefault: boolean;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }
  creditCardHolderInfo: {
    name: string;
    cpfCnpj: string;
  }
}
