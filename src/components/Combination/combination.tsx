import React, { useEffect, useState } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import { ScrollView, XStack, YStack, Button } from 'tamagui'

import CustomButton from '../button/customButton'
import CustomHeader from '../header/customHeader'
import { getStorage } from '@/app/utils/utils'
import { useNavigation, useRoute } from '@react-navigation/native'
import { InputNome } from './InputNome'
import { DropdownCampo } from './DropdownCampo'
import { BloqueioFornecedoresCampo } from './BloqueioFornecedores'
import { PreferenciaFornecedorCampo } from './PreferenciaFornecedorTipo'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { ContainerPreferenciasProduto } from './ContainerPreferenciasProduto'
import { getCombinationsByRestaurant } from '@/src/services/combinationsService'

export interface SuplierCombination {
  id: string
  nomefornecedor: string
}

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id?: string }
  const { combinacao, updateCampo } = useCombinacao()
  const { setCombinacao, resetCombinacao } = useCombinacao()
  const [restaurant_id, setRestaurant_id] = useState<string | null>(null)

  useEffect(() => {
    console.log('id da rota', id)
    const carregarCombinacao = async () => {
      if (!id) return // Se for criar nova, não faz nada

      try {
        const dados = await getCombinationsByRestaurant(id) // Busca dados da combinação no back-end
        if (dados) {
          //resetCombinacao() // Limpa o context anterior
          //setCombinacao(dados)
        }
      } catch (err) {
        console.error('Erro ao carregar combinação:', err)
      }
    }

    carregarCombinacao()
  }, [])

  useEffect(() => {
    const fetchStoredRestaurant = async () => {
      const storedValue = await getStorage('selectedRestaurant')

      if (storedValue) {
        try {
          const parsedValue = JSON.parse(storedValue)
          const restaurante = parsedValue?.restaurant ?? parsedValue ?? null
          const idFromRoute = (route.params as { restaurantId?: string })?.restaurantId

          setRestaurant_id(idFromRoute ?? restaurante?.id ?? null)
        } catch {
          setRestaurant_id(null)
        }
      }
    }

    fetchStoredRestaurant()
  }, [])

  const handleGoBack = () => {
    navigation.goBack()
  }

  console.log('combinação no componente', combinacao)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader title="Combinação 1" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt="$2">
          <InputNome />

          <DropdownCampo
            campo="dividir_em_maximo"
            label="Dividir em, no máximo:"
            items={[
              { label: '2 fornecedores', value: 2 },
              { label: '3 fornecedores', value: 3 },
              { label: '4 fornecedores', value: 4 }
            ]}
            value={combinacao.dividir_em_maximo}
            onChange={(val) => updateCampo('dividir_em_maximo', val)}
            zIndex={3000}
          />

          <BloqueioFornecedoresCampo />

          <PreferenciaFornecedorCampo />

          {combinacao.preferencia_fornecedor_tipo === 'especifico' && <ContainerPreferenciasProduto />}
        </YStack>

        {Platform.OS === 'web' ? (
          <XStack width={'74%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <Button
                onPress={async () => {
                  try {
                    if (!id) {
                      console.warn('ID da combinação não encontrado.')
                      return
                    }
                    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/combination/${id}/delete`, {
                      method: 'DELETE'
                    })
                    if (response.ok) {
                      console.log('Combinação excluída!')
                      handleGoBack()
                    } else {
                      const errorData = await response.json()
                      console.error('Erro ao excluir combinação:', errorData)
                    }
                  } catch (error) {
                    console.error('Erro ao excluir combinação:', error)
                  }
                }}
                hoverStyle={{
                  background: '#f84949ff',
                  opacity: 0.9
                }}
                backgroundColor="#f84949ff"
                color="#FFFFFF"
                borderColor="#A9A9A9"
                borderWidth={1}
              >
                Excluir combinação
              </Button>
            </YStack>
            <YStack f={1}>
              <Button
                onPress={async () => {
                  try {
                    // Envia para o backend
                    const response = await fetch(`${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(combinacao)
                    })

                    console.log('Combinação salva!', response)
                    // Navegue ou mostre feedback ao usuário
                    navigation.goBack()
                  } catch (error) {
                    console.error('Erro ao salvar combinação:', error)
                    // Mostre alerta ou feedback de erro
                  }
                }}
                hoverStyle={{
                  background: '#1DC588',
                  opacity: 0.9
                }}
                backgroundColor="#1DC588"
                color="#FFFFFF"
                borderColor="#A9A9A9"
                type="submit"
              >
                Salvar combinação
              </Button>
            </YStack>
          </XStack>
        ) : (
          <XStack width={'88%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <CustomButton title="Excluir" onPress={handleGoBack} backgroundColor="#f84949ff" textColor="#FFFFFF" borderColor="#A9A9A9" borderWidth={1} />
            </YStack>
            <YStack f={1}>
              <CustomButton
                title="Salvar"
                fontSize={10}
                onPress={() => {
                  console.log('Salvar combinação', combinacao)
                }}
                backgroundColor="#1DC588"
                textColor="#FFFFFF"
                borderColor="#A9A9A9"
                Salvar
              />
            </YStack>
          </XStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
