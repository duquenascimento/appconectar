// Ainda não existe endpoint de backend para resolver código de indicação -> nome do promotor
// (depende da CH-754). Por enquanto retorna undefined para não bloquear a exibição da tela.
export async function getPromoterNameByCode(code: string): Promise<string | undefined> {
  return undefined;
}
