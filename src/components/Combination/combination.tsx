import React, { useEffect, useState, useCallback } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import { ScrollView, XStack, YStack, Button } from 'tamagui'
import * as Yup from 'yup'
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
import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'
import CustomAlert from '../modais/CustomAlert'

export interface SuplierCombination {
  id: string
  nomefornecedor: string
}

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id?: string }
  const { combinacao, updateCampo } = useCombinacao()
  const [isModaltVisible, setIsModalVisible] = useState<boolean>(false)

  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const carregarCombinacao = async () => {
      if (!id) return

      try {
        const dados = await getCombinationsByRestaurant(id)
        if (!dados) {
          throw new Error('Erro ao encontrar combinação')
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
          const finalId = idFromRoute ?? restaurante?.id ?? null

          updateCampo('restaurant_id', finalId ?? '')
        } catch {
          updateCampo('restaurant_id', '')
        }
      }
    }
    fetchStoredRestaurant()
  }, [])

  const handleGoBack = () => {
    navigation.goBack()
  }

  const createCombination = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(combinacao)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }
      setAlertTitle('Sucesso!')
      setAlertMessage('Combinação criada com sucesso!')
      setIsAlertVisible(true)
      setAlertCallback(() => navigation.goBack)
    } catch (error) {
      console.error('Erro ao salvar combinação:', error)
      setAlertTitle('Erro!')
      setAlertMessage('Ocorreu um erro inesperado ao criar a combinação.')
      setIsAlertVisible(true)
    }
  }

  const updateCombination = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/combination/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(combinacao)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      setAlertTitle('Sucesso!')
      setAlertMessage('Combinação atualizada com sucesso!')
      setIsAlertVisible(true)
      setAlertCallback(() => navigation.goBack)
    } catch (error) {
      console.error('Erro ao salvar combinação:', error)
      setAlertTitle('Erro!')
      setAlertMessage('Ocorreu um erro inesperado ao atualizar a combinação.')
      setIsAlertVisible(true)
    }
  }

  const updateCampoAndValidate = useCallback(
    async (campo: string, valor: any) => {
      updateCampo(campo as any, valor)
      try {
        const tempObj = { ...combinacao, [campo]: valor }
        await combinacaoValidationSchema.validateAt(campo, tempObj)
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[campo]
          return newErrors
        })
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          setValidationErrors((prev) => ({
            ...prev,
            [campo]: err.message
          }))
        }
      }
    },
    [combinacao, updateCampo]
  )

  const clearPreferenceErrors = useCallback(() => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors['preferencias']
      return newErrors
    })
  }, [])

  const handleSaveCombination = async () => {
    try {
      setValidationErrors({})
      await combinacaoValidationSchema.validate(combinacao, { abortEarly: false })

      if (id) {
        await updateCombination()
      } else {
        await createCombination()
      }
    } catch (validationErrors) {
      if (validationErrors instanceof Yup.ValidationError) {
        const newErrors: Record<string, string> = {}
        validationErrors.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message
          }
        })
        setValidationErrors(newErrors)
        setAlertTitle('Campos Obrigatórios')
        setAlertMessage('Por favor, corrija os campos destacados.')
        setIsAlertVisible(true)
      } else {
        setAlertTitle('Erro Inesperado')
        setAlertMessage('Ocorreu um erro inesperado ao salvar a combinação.')
        setIsAlertVisible(true)
      }
    }
  }

  const handleDeleteCombination = async () => {
    try {
      if (!id) {
        console.warn('ID da combinação não encontrado.')
        return
      }
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/combination/${id}/delete`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Erro ao excluir combinação:', error)
    } finally {
      setAlertTitle('Sucesso!')
      setAlertMessage('Combinação excluída com sucesso!')
      setIsAlertVisible(true)
      setAlertCallback(() => navigation.goBack)
    }
  }

  const handleAlertConfirm = () => {
    setIsAlertVisible(false)
    if (alertCallback) {
      alertCallback()
    }
    setAlertCallback(null)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader title={id ? `${combinacao.nome}` : 'Nova combinação'} onBackPress={handleGoBack} />
      <CustomAlert visible={isAlertVisible} title={alertTitle} message={alertMessage} onConfirm={handleAlertConfirm} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt="$2">
          <InputNome error={validationErrors.nome} onChangeText={(text) => updateCampoAndValidate('nome', text)} value={combinacao.nome} />

          <DropdownCampo
            campo="dividir_em_maximo"
            label="Dividir em no máximo:"
            items={[
              { label: '2 fornecedores', value: 2 },
              { label: '3 fornecedores', value: 3 },
              { label: '4 fornecedores', value: 4 }
            ]}
            value={combinacao.dividir_em_maximo}
            onChange={(val) => updateCampoAndValidate('dividir_em_maximo', val)}
            zIndex={3000}
            error={validationErrors.dividir_em_maximo}
          />

          <BloqueioFornecedoresCampo error={validationErrors.fornecedores_bloqueados} onChange={(val) => updateCampoAndValidate('fornecedores_bloqueados', val)} />

          <PreferenciaFornecedorCampo error={validationErrors.fornecedores_especificos} onChange={(val) => updateCampoAndValidate('fornecedores_especificos', val)} />

          {combinacao.preferencia_fornecedor_tipo === 'especifico' && <ContainerPreferenciasProduto error={validationErrors.preferencias} onClearErrors={clearPreferenceErrors} />}
        </YStack>
        {Platform.OS === 'web' ? (
          <XStack width={'74%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <Button
                onPress={() => {
                  if (id) {
                    handleDeleteCombination()
                  } else {
                    handleGoBack()
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
                {id ? 'Excluir combinação' : 'Cancelar'}
              </Button>
            </YStack>
            <YStack f={1}>
              <Button
                onPress={handleSaveCombination}
                hoverStyle={{
                  background: '#1DC588',
                  opacity: 0.9
                }}
                backgroundColor="#1DC588"
                color="#FFFFFF"
                borderColor="#A9A9A9"
              >
                Salvar combinação
              </Button>
            </YStack>
          </XStack>
        ) : (
          <XStack width={'88%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <CustomButton
                title={id ? 'Excluir' : 'Cancelar'}
                onPress={() => {
                  if (id) {
                    handleDeleteCombination()
                  } else {
                    handleGoBack()
                  }
                }}
                backgroundColor="#f84949ff"
                textColor="#FFFFFF"
              />
            </YStack>
            <YStack f={1}>
              <CustomButton title="Salvar" onPress={handleSaveCombination} backgroundColor="#1DC588" textColor="#FFFFFF" />
            </YStack>
          </XStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
