interface CartItem {
  productId: string;
  amount: number;
  obs: string;
}

interface SimplifiedCartItem {
  productId: string;
}

interface FilterResult {
  carts: CartItem[];
  cartToExclude: SimplifiedCartItem[];
}

export function filterCarts(carts: CartItem[], cartToExclude: CartItem[]): FilterResult {
  const excludeIds = new Set(cartToExclude.map(item => item.productId));
  const filteredCarts = carts.filter(item => !excludeIds.has(item.productId));
  const simplifiedCartToExclude = cartToExclude.map<SimplifiedCartItem>(item => ({
    productId: item.productId
  }));

  return {
    carts: filteredCarts,
    cartToExclude: simplifiedCartToExclude
  };
}