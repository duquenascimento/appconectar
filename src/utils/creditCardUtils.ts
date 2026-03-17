import { CreditCard } from "../types/paymentTypes";

export function extractDefaultCreditCart(creditCards: CreditCard[]): CreditCard | null {
  if(!creditCards || creditCards.length === 0) {
    return null;
  }
  
  const defaultCreditCard = creditCards.find(creditCard => creditCard.isDefault);
  return defaultCreditCard || creditCards[0];
}

export const formatCreditCardNumber = (text: string) => {
  return text
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .substring(0, 19);
};
