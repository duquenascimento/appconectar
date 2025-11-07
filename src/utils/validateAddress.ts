export interface AddressValidationResult {
  isValid: boolean
  message: string
}

export function validateAddress (selectedRestaurant: any): AddressValidationResult {
  const addressInfo = selectedRestaurant?.restaurant?.addressInfos?.[0]

  if (!addressInfo) {
    return {
      isValid: false,
      message: 'Nenhum endereço de entrega encontrado. Por favor, cadastre um endereço válido.'
    }
  }

  const missingFields: string[] = []
  if (!addressInfo.address?.trim()) missingFields.push('Logradouro')
  if (!addressInfo.localNumber?.trim()) missingFields.push('Número')
  if (!addressInfo.neighborhood?.trim()) missingFields.push('Bairro')
  if (!addressInfo.city?.trim()) missingFields.push('Cidade')
  if (!addressInfo.responsibleReceivingName?.trim()) missingFields.push('Nome de quem recebe')
  if (!addressInfo.responsibleReceivingPhoneNumber?.trim()) missingFields.push('Telefone')

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Os seguintes campos estão incompletos:\n\n- ${missingFields.join('\n- ')}\n\n Por favor, complete-os no cadastro do restaurante.`
    }
  }

  return {
    isValid: true,
    message: 'Dados de endereço válidos.'
  }
}


