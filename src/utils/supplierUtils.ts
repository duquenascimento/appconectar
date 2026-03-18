import { CombinationSupplierDTO } from '../services/combinationsService';
import { CombinationSupplier } from "../types/suppliersDataTypes";

export function getSupplierLabel(supplier: CombinationSupplier): string {
    const rateString = isNaN(Number(supplier.nota)) ? 'NOVO' : `⭐️ ${supplier.nota}`;

    return `${supplier.nomefornecedor} (${rateString})`;
}

export function getCombinationSupplierDTOLabel(supplier: CombinationSupplierDTO): string {
    const rateString = isNaN(Number(supplier.rating)) ? 'NOVO' : `⭐️ ${supplier.rating}`;

    return `${supplier.name} (${rateString})`;
}