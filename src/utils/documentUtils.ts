import { CnpjDataResponse } from "../types/registerTypes";

export function isCnpjData(data: any): data is CnpjDataResponse {
    return data && 'cnpj' in data && 'razao_social' in data;
}

export function formatCPF(value: string): string {
    return value
        .replace(/\D/g, '') // Remove caracteres não numéricos
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após os três primeiros dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após os próximos três dígitos
        .replace(/(\d{3})(\d)/, '$1-$2') // Adiciona traço após os próximos três dígitos
        .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 11 caracteres (com pontuação)
}

export function formatCNPJ(value: string): string {
    return value
        .replace(/\D/g, '') // Remove caracteres não numéricos
        .replace(/^(\d{2})(\d)/, '$1.$2') // Adiciona ponto após os dois primeiros dígitos
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Adiciona ponto após o terceiro grupo de três dígitos
        .replace(/\.(\d{3})(\d)/, '.$1/$2') // Adiciona barra após o segundo grupo de três dígitos
        .replace(/(\d{4})(\d)/, '$1-$2') // Adiciona traço após o grupo de quatro dígitos
        .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 14 caracteres (com pontuação)
}

export type DocumentType = 'CPF' | 'CNPJ';

export function getDocumentType(value: string): DocumentType {
    const onlyNumbers = value.replace(/\D/g, '');
    return onlyNumbers.length <= 11 ? 'CPF' : 'CNPJ';
}

export function formatDocument(value: string, documentType: DocumentType): string {
    if (documentType === 'CPF') {
        return formatCPF(value);
    }
    return formatCNPJ(value);
}