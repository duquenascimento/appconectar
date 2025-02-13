export function formatCNPJ(value: string ) {

    return value
    .replace(/\D/g, '') // Remove caracteres não numéricos
    .replace(/^(\d{2})(\d)/, '$1.$2') // Adiciona ponto após os dois primeiros dígitos
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Adiciona ponto após o terceiro grupo de três dígitos
    .replace(/\.(\d{3})(\d)/, '.$1/$2') // Adiciona barra após o segundo grupo de três dígitos
    .replace(/(\d{4})(\d)/, '$1-$2') // Adiciona traço após o grupo de quatro dígitos
    .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 14 caracteres (com pontuação)

}
