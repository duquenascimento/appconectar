export type PixCharge = {
  description?: string | null;
  id: string;
  transactionId: number;
  txId: string;
  status_id: number;
  qrCode: string;
  encodedImage: string;
  expirationDate: string;
  createdAt: string;
  updatedAt: string;
}

export type PixChargeCreateDto = {
  orderId: string;
  amount: number;
  description?: string;
}