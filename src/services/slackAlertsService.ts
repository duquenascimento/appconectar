export interface MissingItemsPayload {
  externalId: string;
  restaurantName: string;
  orderId: string;
  missingItems: string[];
}

export async function sendMissingItemsAlert(payload: MissingItemsPayload): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/alerts/orderMissingItems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Erro ao enviar alerta de itens faltantes:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Falha ao chamar rota de alerta:', error);
    return false;
  }
}
