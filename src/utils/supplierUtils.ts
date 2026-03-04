import { CombinationSupplier } from "../types/suppliersDataTypes";

export function getSupplierLabel(supplier: CombinationSupplier): string {
    const rateString = isNaN(Number(supplier.nota)) ? 'NOVO' : `⭐️ ${supplier.nota}`;

    return `${supplier.nomefornecedor} (${rateString})`;
}