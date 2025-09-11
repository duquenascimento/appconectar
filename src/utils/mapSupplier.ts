import { Supplier } from '@/src/services/supplierService'
import { SuplierCombination } from '@/app/combination' 

export function mapSuppliers(apiData: Supplier): SuplierCombination {
  return {
    id: apiData.id,
    nomefornecedor: apiData.nomefornecedor
  }
}
