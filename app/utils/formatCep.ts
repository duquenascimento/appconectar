export const formatCep = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');

    // Aplica a máscara de CEP
    const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');

    // Define o valor formatado
    return formatted;
}
