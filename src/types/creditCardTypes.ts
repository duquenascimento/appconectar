export interface CreateCreditCardDto {
  restaurantId: string;
  nickname: string;
  isDefault: boolean;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  }
  creditCardHolderInfo: {
    name: string;
    cpfCnpj: string;
  }
}

export type CreditCard = {
  id: string;
  restaurantId: string;
  nickname: string;
  fourLastDigits: string;
  brand: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}