import { CombinationSupplierDTO } from '@/src/services/combinationsService';
import { Combinacao, TipoFornecedor } from '@/src/types/combinationTypes';

type SupplierAvailabilityRules = Pick<
    Combinacao,
    | 'bloquear_fornecedores'
    | 'fornecedores_bloqueados'
    | 'preferencia_fornecedor_tipo'
    | 'fornecedores_especificos'
>;

export function getAvailableCombinationSuppliersFromDTO(
    suppliers: CombinationSupplierDTO[],
    rules: SupplierAvailabilityRules,
): CombinationSupplierDTO[] {
    const blockedSuppliers = rules.fornecedores_bloqueados || [];
    const specificSuppliers = rules.fornecedores_especificos || [];

    let filteredSuppliers = suppliers.filter((s) => s.isAvailable);

    if (rules.bloquear_fornecedores && blockedSuppliers.length > 0) {
        filteredSuppliers = filteredSuppliers.filter(
            (supplier) => !blockedSuppliers.includes(supplier.externalId),
        );
    }

    if (
        rules.preferencia_fornecedor_tipo === TipoFornecedor.ESPECIFICO &&
        specificSuppliers.length > 0
    ) {
        filteredSuppliers = filteredSuppliers.filter((supplier) =>
            specificSuppliers.includes(supplier.externalId),
        );
    }

    return filteredSuppliers;
}

export function getAvailableCombinationSupplierIdsFromDTO(
    suppliers: CombinationSupplierDTO[],
    rules: SupplierAvailabilityRules,
): string[] {
    return getAvailableCombinationSuppliersFromDTO(suppliers, rules).map((s) => s.externalId);
}