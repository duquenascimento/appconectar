import React, { useCallback, useEffect, useState } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, Text, Input, Label, XStack, YStack, Separator, Button } from 'tamagui'

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
import { Formik, useFormik } from 'formik'
import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'

export interface SuplierCombination {
  id: string
  nomefornecedor: string
}

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()

  const [suppliers, setSupplers] = useState<SuplierCombination[]>([])
  const [supplierItems, setSupplierItems] = useState<{ label: string; value: string }[]>([])
  const [products, setProducts] = useState<ProrityProductsCombination[]>([])
  const [restaurant_id, setRestaurant_id] = useState<string | null>(null)

  const [openBlockSuppliers, setOpenBlockSupplers] = useState(false)
  const [open, setOpen] = useState(false)
  const [openSupplier, setOpenSupplier] = useState(false)
  const [openPreference, setOpenPreference] = useState(false)
  const [priorityList, setPriorityList] = useState<number[]>([1])

  const [blockedSuppliersValue, setBlockedSuppliersValue] = useState<string[]>([])
  const [prioritiesData, setPrioritiesData] = useState<
    Record<
      number,
      {
        tipo: string
        produtos: {
          produto_sku: string
          classe: string
          fornecedores: string[]
          acao_na_falha: string
        }[]
      }
    >
  >({})

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
      const preferencias = Object.entries(prioritiesData).map(([ordem, data]) => ({
        ordem: Number(ordem),
        tipo: data.tipo,
        produtos: data.produtos
      }))

      const combinationData = {
        ...values,
        preferencias,
        restaurant_id: restaurant_id ?? ''
      }

      try {
        await fetch(`${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(combinationData)
        })
      } catch (erro) {
        console.error('Erro ao criar combinação:', erro)
      }
    }
  })

  useEffect(() => {
    if (!formik.values.bloquear_fornecedores && formik.values.fornecedores_bloqueados.length > 0) {
      formik.setFieldValue('fornecedores_bloqueados', [])
    }
  }, [formik.values.bloquear_fornecedores])

  useEffect(() => {
    if (formik.values.preferencia_fornecedor_tipo !== 'especifico' && formik.values.fornecedores_especificos.length > 0) {
      formik.setFieldValue('fornecedores_especificos', [])
    }
  }, [formik.values.preferencia_fornecedor_tipo])

  const handlePriorityChange = (
    number: number,
    data: {
      tipo: string
      produtos: {
        produto_sku: string
        classe: string
        fornecedores: string[]
        acao_na_falha: string
      }[]
    }
  ) => {
    setPrioritiesData((prev) => ({
      ...prev,
      [number]: data
    }))
  }

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

  const addPriority = () => {
    setPriorityList((prev) => [...prev, prev.length + 1])
  }

  /*  const handleSave = async () => {
    const preferencias = Object.entries(prioritiesData).map(([ordem, data]) => ({
      ordem: Number(ordem),
      tipo: data.tipo,
      produtos: data.produtos
    }))

    const combinationData = {
      restaurant_id,
      nome,
      bloquear_fornecedores,
      dividir_em_maximo,
      fornecedor_especifico,
      fornecedor_bloqueado,
      preferencia_fornecedor_tipo,
      definir_preferencia_produto,
      preferencias,
      preferencias_hard
    }

    try {
      const result = await fetch(`${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(combinationData)
      })
      const combinacao = await result.json()
    } catch (erro) {
      console.error('Erro ao criar combinação:', erro)
    }
  } */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader title="Combinação 1" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt="$2">
          {/* Nome da combinação */}
          <YStack>
            <Label>Nome da combinação</Label>
            <Input placeholder="Lorem ipsum" value={formik.values.nome} onChangeText={formik.handleChange('nome')} onBlur={formik.handleBlur('nome')} />
            {formik.touched.nome && formik.errors.nome && (
              <Text p={'$1'} color="red">
                {formik.errors.nome}
              </Text>
            )}
          </YStack>

          {/* Dropdown máximo de fornecedores */}
          <YStack style={{ zIndex: 3000 }}>
            <Label>Dividir em no máximo</Label>
            <DropDownPicker
              open={open}
              value={formik.values.dividir_em_maximo}
              items={[
                { label: '2 fornecedores', value: 2 },
                { label: '3 fornecedores', value: 3 },
                { label: '4 fornecedores', value: 4 }
              ]}
              setOpen={setOpen}
              setValue={(val) => formik.setFieldValue('dividir_em_maximo', val())}
              multiple={false}
              zIndex={3000}
              zIndexInverse={1000}
            />
            {formik.touched.dividir_em_maximo && formik.errors.dividir_em_maximo && (
              <Text p={'$1'} color="red">
                {formik.errors.dividir_em_maximo}
              </Text>
            )}
          </YStack>

          {/* Bloqueio de fornecedores */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" gap={3} borderRadius="$4" zIndex={2000}>
            <Text fontWeight="bold">Bloquear fornecedores</Text>
            <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
            <Separator my="$3" />
            <Text>Bloquear fornecedores na combinação?</Text>
            <XStack>
              <CustomRadioButton selected={formik.values.bloquear_fornecedores} onPress={() => formik.setFieldValue('bloquear_fornecedores', true)} label="Sim" />
              <CustomRadioButton selected={!formik.values.bloquear_fornecedores} onPress={() => formik.setFieldValue('bloquear_fornecedores', false)} label="Não" />
            </XStack>
            {formik.values.bloquear_fornecedores && (
              <YStack style={{ zIndex: 1000 }}>
                <Label>Fornecedores bloqueados</Label>
                <DropDownPicker
                  open={openBlockSuppliers}
                  setOpen={setOpenBlockSupplers}
                  multiple={true}
                  closeAfterSelecting={true}
                  value={blockedSuppliersValue}
                  setValue={(val) => {
                    const newValue = typeof val === 'function' ? val(blockedSuppliersValue) : val
                    if (Array.isArray(newValue)) {
                      setBlockedSuppliersValue(newValue)
                      formik.setFieldValue('fornecedores_bloqueados', newValue)
                    }
                    setTimeout(() => setOpenBlockSupplers(false), 200)
                  }}
                  items={supplierItems}
                  setItems={setSupplierItems}
                  placeholder="Selecione os fornecedores"
                  listMode="SCROLLVIEW"
                  translation={{
                    PLACEHOLDER: 'Selecione os fornecedores',
                    SELECTED_ITEMS_COUNT_TEXT: '{count} selecionado(s)',
                    NOTHING_TO_SHOW: 'Nenhum fornecedor disponível'
                  }}
                  zIndex={1000}
                  zIndexInverse={3000}
                />
                {blockedSuppliersValue.length > 0 && (
                  <YStack mt="$2" p="$2" borderWidth={1} borderRadius={8} borderColor="$gray5" gap="$2">
                    <Text>Fornecedores bloqueados:</Text>
                    <XStack flexWrap="wrap" gap="$2">
                      {blockedSuppliersValue.map((id) => {
                        const label = supplierItems.find((s) => s.value === id)?.label ?? id
                        return (
                          <XStack key={id} borderRadius={6} px="$2" py="$1" alignItems="center" gap="$1" backgroundColor="#E0E0E0">
                            <Button
                              size="$1"
                              circular
                              backgroundColor="transparent"
                              fontSize={'22px'}
                              color={'#777'}
                              onPress={() => {
                                const updated = blockedSuppliersValue.filter((item) => item !== id)
                                setBlockedSuppliersValue(updated)
                                formik.setFieldValue('fornecedores_bloqueados', updated)
                              }}
                            >
                              ×
                            </Button>
                            <Text>{label}</Text>
                          </XStack>
                        )
                      })}
                    </XStack>
                  </YStack>
                )}
                {formik.touched.fornecedores_bloqueados && formik.errors.fornecedores_bloqueados && (
                  <Text p={'$1'} color="red">
                    {formik.errors.fornecedores_bloqueados}
                  </Text>
                )}
              </YStack>
            )}
          </YStack>

          {/* Preferência de fornecedores */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4" zIndex={1000} gap="$2">
            <Text fontWeight="bold">Preferência de fornecedores</Text>
            <CustomSubtitle>Defina as preferências de combinação</CustomSubtitle>

            <YStack marginTop={10} gap="$3">
              <YStack style={{ zIndex: 4000 }}>
                <Label>Combinar meu pedido entre</Label>
                <DropDownPicker
                  open={openPreference}
                  setOpen={setOpenPreference}
                  value={formik.values.preferencia_fornecedor_tipo}
                  setValue={(val) => formik.setFieldValue('preferencia_fornecedor_tipo', val())}
                  items={[
                    { label: 'Fornecedores melhor avaliados', value: 'melhor_avaliado' },
                    { label: 'Fornecedores específicos', value: 'especifico' },
                    { label: 'Qualquer fornecedor', value: 'qualquer' }
                  ]}
                  placeholder="Selecione..."
                  zIndex={4000}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{
                    maxHeight: 300
                  }}
                  style={{ marginTop: 5 }}
                  dropDownDirection="BOTTOM"
                />
                {formik.touched.preferencia_fornecedor_tipo && formik.errors.preferencia_fornecedor_tipo && <Text color="red">{formik.errors.preferencia_fornecedor_tipo}</Text>}
              </YStack>

              {formik.values.preferencia_fornecedor_tipo === 'especifico' && (
                <YStack style={{ zIndex: 1000 }}>
                  <Label>Fornecedores específicos</Label>
                  <DropDownPicker
                    open={openSupplier}
                    setOpen={setOpenSupplier}
                    multiple={true}
                    closeAfterSelecting={true}
                    value={formik.values.fornecedores_especificos}
                    setValue={(val) => {
                      const newValue = typeof val === 'function' ? val(formik.values.fornecedores_especificos) : val
                      formik.setFieldValue('fornecedores_especificos', newValue)
                      setTimeout(() => setOpenSupplier(false), 200)
                    }}
                    items={supplierItems.filter((item) => !formik.values.fornecedores_bloqueados.includes(item.value))}
                    setItems={setSupplierItems}
                    placeholder="Selecione os fornecedores"
                    listMode="SCROLLVIEW"
                    translation={{
                      PLACEHOLDER: 'Selecione os fornecedores',
                      SEARCH_PLACEHOLDER: 'Digite para buscar...',
                      SELECTED_ITEMS_COUNT_TEXT: '{count} selecionado(s)',
                      NOTHING_TO_SHOW: 'Nenhum fornecedor disponível'
                    }}
                    zIndex={1000}
                    zIndexInverse={3000}
                  />

                  {formik.values.fornecedores_especificos.length > 0 && (
                    <YStack mt="$2" p="$2" borderWidth={1} borderRadius={8} borderColor="$gray5" gap="$2">
                      <Text>Fornecedores específicos selecionados:</Text>
                      <XStack flexWrap="wrap" gap="$2">
                        {formik.values.fornecedores_especificos.map((id) => {
                          const label = supplierItems.find((s) => s.value === id)?.label ?? id
                          return (
                            <XStack key={id} borderRadius={6} px="$2" py="$1" alignItems="center" gap="$1" backgroundColor="#E0E0E0">
                              <Button
                                size="$1"
                                circular
                                backgroundColor="transparent"
                                fontSize={'22px'}
                                color={'#777'}
                                onPress={() => {
                                  const updated = formik.values.fornecedores_especificos.filter((item) => item !== id)
                                  formik.setFieldValue('fornecedores_especificos', updated)
                                }}
                              >
                                ×
                              </Button>
                              <Text>{label}</Text>
                            </XStack>
                          )
                        })}
                      </XStack>
                    </YStack>
                  )}

                  {formik.touched.fornecedores_especificos && formik.errors.fornecedores_especificos && (
                    <Text p={'$1'} color="red">
                      {formik.errors.fornecedores_especificos}
                    </Text>
                  )}
                </YStack>
              )}
            </YStack>
          </YStack>

          {/* Preferência de produtos */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4">
            <YStack borderBottomWidth={1} pb="$3" borderColor="$gray4">
              <Text fontSize={16}>Preferência de produtos</Text>
              <CustomSubtitle>Preferência de produtos por fornecedor</CustomSubtitle>
            </YStack>

            <YStack borderBottomWidth={1} py="$3" borderColor="$gray4" gap={6}>
              <Text fontSize={14}>Definir preferência de produto para um ou mais fornecedores?</Text>
              <XStack>
                <CustomRadioButton selected={formik.values.definir_preferencia_produto} onPress={() => formik.setFieldValue('definir_preferencia_produto', true)} label="Sim" />
                <CustomRadioButton selected={!formik.values.definir_preferencia_produto} onPress={() => formik.setFieldValue('definir_preferencia_produto', false)} label="Não" />
              </XStack>
              {formik.values.definir_preferencia_produto && (
                <>
                  {/* Lista de prioridades */}
                  {priorityList.map((number, index) => (
                    <PrioritySection key={number} priorityNumber={number} products={products} selectedSuppliers={formik.values.fornecedores_especificos} suppliers={suppliers} onChange={handlePriorityChange} formErrors={formik.errors.preferencias?.[index]} formTouched={formik.touched.preferencias?.[index]} />
                  ))}

                  {/* Botão para adicionar nova prioridade */}
                  <XStack width={'74%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
                    <YStack f={1}>
                      <Button onPress={addPriority} backgroundColor="#ffffffff" color="#000000ff" borderColor="#A9A9A9" borderWidth={0}>
                        + Adicionar preferência
                      </Button>
                    </YStack>
                  </XStack>
                </>
              )}
            </YStack>
          </YStack>
        </YStack>
        {/* Botões rodapé */}
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
