export type TCart = {
  productId: string;
  amount: number;
  obs: string;
  addOrder: number;
};

export type CartProduct = {
  name: string;
  orderUnit: string;
  quotationUnit: string;
  convertedWeight: number;
  class: string;
  sku: string;
  id: string;
  active: true;
  createdBy: string;
  createdAt: string;
  changedBy: string;
  updatedAt: string;
  image: string[];
  favorite?: boolean;
  obs?: string;
  amount?: number;
  mediumWeight: number;
  firstUnit: number;
  secondUnit: number;
  thirdUnit: number;
  addOrder: number;
};
