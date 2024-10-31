interface Discount {
    threshold: number; // Valor necessário para que o desconto seja aplicado
    rate: number; // Porcentagem de desconto, no formato 0.1 = 10%
}
  
interface Product {
    id: string; // ID do produto
    class: string; // Classe do produto
    quantity: number; // Quantidade solicitada
}
  
interface SupplierProduct {
    productId: string; // ID do produto (referência à entidade Product)
    price: number; // Preço unitário do produto para este fornecedor
}
  
interface Supplier {
    id: string; // ID do fornecedor
    products: SupplierProduct[]; // Lista de produtos otimizada com o preço para este fornecedor
    discounts: Discount[]; // Descontos aplicáveis do fornecedor
    minValue: number // Valor mínimo para o fornecedor aceitar o pedido ao final
}
  
interface FavoriteProduct {
    supplierId: string; // ID do fornecedor preferido
    productId: string; // ID do produto preferido
    unavailableIfFailed: boolean // Se preferencia falhar deixar produto(s) como indisponível(eis) -> true, caso contrário ignorar preferencia -> false
}
  
interface FavoriteCategory {
    supplierId: string; // ID do fornecedor preferido
    class: string; // Class preferida
    unavailableIfFailed: boolean // Se preferencia falhar deixar produto(s) como indisponível(eis) -> true, caso contrário ignorar preferencia -> false
}
  
export interface Request {
    products: Product[]; // Lista de produtos disponíveis (informações comuns)
    suppliers: Supplier[]; // Lista de fornecedores
    favoriteProducts: FavoriteProduct[]; // Produtos preferidos
    favoriteCategories: FavoriteCategory[]; // Categorias preferidas
    fee: number; // Taxa do cliente, no formato 0.05 = 5%
    zeroFee: string[] // IDs dos distribuidores que não terão a Taxa Conéctar aplicada sobre o cálculo
}

/* ----------------------------------------------------------------------- */

interface Cart {
    productId: string // ID do produto
    amount: number // Quantidade solicitada
    value: number // Valor final do produto
    valueWithoutFee: number // Valor final sem taxa do produto
    unitValue: number // Preço unitário do produto
    unitValueWithoutFee: number // Preço unitário sem taxa do produto
}

interface Supplier {
    id: string // ID do fornecedor
    orderValue: number // Valor final com este fornecedor
    orderValueWithoutFee: number // Valor final sem a taxa com este fornecedor
    feeUsed: number // Taxa utilizada com este fornecedor
    cart: Cart[] // Carrinho com os itens que ficaram com este fornecedor
}

export interface Response {
    totalOrderValue: number // Valor total da compra
    suppliers: Supplier[] // Lista de fornecedores selecionados
}
