import { Supplier } from '@/src/services/supplierService';
import { SuplierCombination } from '@/src/components/Combination/combination'; 

export function mapSuppliers (apiData: Supplier): SuplierCombination {
  return {
    id: apiData.id,
    nomeFornecedor: apiData.nomeFornecedor
  };
}