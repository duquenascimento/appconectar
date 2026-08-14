/**
 * Ajustes de comportamento do app entregues pelo backend (GET /client-settings).
 *
 * A fonte de verdade é a tabela `app_setting` no backend. Para publicar um novo ajuste,
 * adicione UM campo aqui e UM valor de último recurso em `FALLBACK_CLIENT_SETTINGS`
 * (src/contexts/clientSettings.context.tsx) — nada mais precisa mudar.
 */
export interface ClientSettings {
  /**
   * Máximo de dias no passado permitido em uma cotação retroativa.
   * Limite inclusivo: com 90, `hoje - 90` é permitido e `hoje - 91` é recusado pelo backend.
   */
  maxRetroactiveQuotationDays: number;
}

export interface GetClientSettingsResponseDTO {
  status: number;
  data: ClientSettings;
  msg?: string;
}
