interface Discount {
    threshold: number; // Value required for the discount to be applied
    rate: number; // Discount percentage, in the format 0.1 = 10%
}

interface Product {
    id: string; // Product ID
    class: string; // Product class
    quantity: number; // Quantity requested
}

interface SupplierProduct {
    productId: string; // Product ID (reference to the Product entity)
    price: number; // Unit price of the product for this supplier
}

interface Supplier {
    id: string; // Supplier ID
    products: SupplierProduct[]; // Optimized list of products with the price for this supplier
    discounts: Discount[]; // Applicable discounts from the supplier
    minValue: number // Minimum value for the supplier to accept the order at the end
}

interface FavoriteProduct {
    supplierId: string; // ID of the preferred supplier
    productId: string; // Preferred product ID
    unavailableIfFailed: boolean // If preference fails, leave product(s) as unavailable -> true, otherwise ignore preference -> false
}
    
interface FavoriteCategory {
    supplierId: string; // Preferred supplier ID
    class: string; // Preferred class
    unavailableIfFailed: boolean // If preference fails, leave product(s) as unavailable -> true, otherwise ignore preference -> false
}
    
export interface Request {
    products: Product[]; // List of available products (common information)
    suppliers: Supplier[]; // List of suppliers
    favoriteProducts: FavoriteProduct[]; // Preferred products
    favoriteCategories: FavoriteCategory[]; // Preferred categories
    fee: number; // Customer fee, in the format 0.05 = 5%
    zeroFee: string[] // IDs of distributors that will not have the Conéctar Fee applied to the calculation
    maxSupplier: number // Max. number of suppliers allowed
}
