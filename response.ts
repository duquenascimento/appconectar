interface Cart {
    productId: string // Product ID
    amount: number // Quantity ordered
    value: number // Final product price
    valueWithoutFee: number // Final product price without fee
    unitValue: number // Product unit price
    unitValueWithoutFee: number // Product unit price without fee
}

interface Supplier {
    id: string // Supplier ID
    orderValue: number // Final price with this supplier
    orderValueWithoutFee: number // Final price without fee with this supplier
    feeUsed: number // Fee used with this supplier
    cart: Cart[] // Cart with items that remained with this supplier
}

export interface Response {
    totalOrderValue: number // Total purchase price
    suppliers: Supplier[] // List of selected suppliers
}