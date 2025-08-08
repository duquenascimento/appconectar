import React, { useCallback, useEffect, useState } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, Text, Label, XStack, YStack, Separator, Button } from 'tamagui'

import CustomButton from '../button/customButton'
import CustomSubtitle from '../subtitle/customSubtitle'
import { PrioritySection } from './prioridade'
import CustomHeader from '../header/customHeader'
import { getAllSuppliers } from '@/src/services/supplierService'
import { mapSuppliers } from '@/app/utils/mapSupplier'
import { CustomRadioButton } from '../button/customRadioButton'
import { getAllProducts } from '@/src/services/productsService'
import { mapProducts } from '@/app/utils/mapProducts'
import { ProrityProductsCombination } from './prioridade'
import { getStorage } from '@/app/utils/utils'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FieldArray, FormikProvider, useFormik } from 'formik'
import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'
import CustomAlert from '../modais/CustomAlert'
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert'
import { InputNome } from './InputNome'
import { DropdownCampo } from './DropdownCampo'
import { BloqueioFornecedoresCampo } from './BloqueioFornecedores'
import { PreferenciaFornecedorCampo } from './PreferenciaFornecedorTipo'
import { PreferenciasProdutoCampo } from './PreferenciasProdutoCampo'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { ContainerPreferenciasProduto } from './ContainerPreferenciasProduto'
import { TipoFornecedor } from '@/src/types/combinationTypes'

export interface SuplierCombination {
  id: string
  nomefornecedor: string
}

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { combinacao, updateCampo } = useCombinacao()

  const [suppliers, setSupplers] = useState<SuplierCombination[]>([])
  const [supplierItems, setSupplierItems] = useState<{ label: string; value: string }[]>([])
  const [products, setProducts] = useState<ProrityProductsCombination[]>([])
  const [restaurant_id, setRestaurant_id] = useState<string | null>(null)

  const [openBlockSuppliers, setOpenBlockSupplers] = useState(false)
  const [open, setOpen] = useState(false)
  const [openSupplier, setOpenSupplier] = useState(false)
  const [openPreference, setOpenPreference] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [preferenciaFornecedorTipo, setPreferenciaFornecedorTipo] = useState<string>('qualquer')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [blockedSuppliersValue, setBlockedSuppliersValue] = useState<string[]>([])

  const initialValues = {
    restaurant_id,
    nome: '',
    dividir_em_maximo: 2,
    bloquear_fornecedores: false,
    fornecedores_bloqueados: [],
    preferencia_fornecedor_tipo: 'qualquer',
    fornecedores_especificos: [],
    definir_preferencia_produto: false,
    preferencias_hard: false,
    preferencias: []
  }

  const formik = useFormik({
    initialValues,
    validationSchema: combinacaoValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const combinationData = {
        ...values,
        restaurant_id: restaurant_id ?? ''
      }

      /* try {
        await fetch(`${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(combinationData)
        })
      } catch (erro) {
        console.error('Erro ao criar combinação:', erro)
      } */

      console.log(combinacao)
    }
  })

  /*   useEffect(() => {
    const { bloquear_fornecedores, fornecedores_bloqueados, preferencia_fornecedor_tipo, fornecedores_especificos, definir_preferencia_produto, preferencias } = formik.values

    if (!bloquear_fornecedores && fornecedores_bloqueados.length > 0) {
      formik.setFieldValue('fornecedores_bloqueados', [])
    }

    if (preferencia_fornecedor_tipo !== 'especifico' && fornecedores_especificos.length > 0) {
      formik.setFieldValue('fornecedores_especificos', [])
    }

    if (!definir_preferencia_produto && preferencias.length > 0) {
      formik.setFieldValue('preferencias', [])
    }
  }, [formik.values.bloquear_fornecedores, formik.values.fornecedores_bloqueados, formik.values.preferencia_fornecedor_tipo, formik.values.fornecedores_especificos, formik.values.definir_preferencia_produto, formik.values.preferencias])
 */
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

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getAllSuppliers()
      if (Array.isArray(data)) {
        const mapped = data.map(mapSuppliers)
        setSupplers(mapped)
        setSupplierItems(
          mapped.map((s) => ({
            label: s.nomefornecedor,
            value: s.id
          }))
        )
      } else {
        throw new Error('Resposta inesperada da API')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro ao buscar combinações:', message)
    }
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const data = await getAllProducts()
      if (Array.isArray(data)) {
        setProducts(data.map(mapProducts))
      } else {
        throw new Error('Resposta inesperada da API')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro ao buscar combinações:', message)
    }
  }, [])

  useEffect(() => {
    loadSuppliers()
    loadProducts()
  }, [loadSuppliers, loadProducts])

  const handleGoBack = () => {
    navigation.goBack()
  }

  useEffect(() => {
    setBlockedSuppliersValue(formik.values.fornecedores_bloqueados)
  }, [formik.values.fornecedores_bloqueados])

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
                onPress={handleGoBack}
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
                onPress={formik.handleSubmit}
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
              <CustomButton title="Salvar" fontSize={10} onPress={formik.handleSubmit as any} backgroundColor="#1DC588" textColor="#FFFFFF" borderColor="#A9A9A9" Salvar />
            </YStack>
          </XStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
