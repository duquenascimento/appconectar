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
import { useNavigation, useRoute } from '@react-navigation/native';

export interface SuplierCombination {
  id: string
  nomefornecedor: string
}

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const [nome, setNome] = useState('')
  const [dividir_em_maximo, setDividir_em_maximo] = useState(2)
  const [suppliers, setSupplers] = useState<SuplierCombination[]>([])
  const [openBlockSuppliers, setOpenBlockSupplers] = useState(false)
  const [bloquear_fornecedores, setBloquear_fornecedores] = useState(false)
  const [fornecedor_bloqueado, setFornecedor_bloqueado] = useState<string[]>([])
  const [preferencia_fornecedor_tipo, setPreferencia_fornecedor_tipo] = useState('qualquer')
  const [preferencias_hard, setPreferencias_hard] = useState(false)
  const [restaurant_id, setRestaurant_id] = useState<string | null>(null)
  const [fornecedor_especifico, setFornecedor_especifico] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [openSupplier, setOpenSupplier] = useState(false)
  const [openPreference, setOpenPreference] = useState(false)
  const [definir_preferencia_produto, setDefinir_preferencia_produto] = useState(false)
  const [priorityList, setPriorityList] = useState<number[]>([1])
  const [products, setProducts] = useState<ProrityProductsCombination[]>([])
  const route = useRoute();
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
        setSupplers(data.map(mapSuppliers))
        console.log('suppliers', suppliers)
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
        console.log('Products', products)
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

  const addPriority = () => {
    setPriorityList((prev) => [...prev, prev.length + 1])
  }

  const handleSave = async () => {
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

    console.log('Payload final para salvar:', combinationData)

    try {
      const result = await fetch(`${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(combinationData)
      })
      const combinacao = await result.json()
      console.log('Dados enviados >>>>', combinacao)
    } catch (erro) {
      console.error('Erro ao criar combinação:', erro)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader title="Combinação 1" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt="$2">
          {/* Nome da combinação */}
          <YStack>
            <Label>Nome da combinação</Label>
            <Input placeholder="Lorem ipsum" value={nome} onChangeText={setNome} />
          </YStack>

          {/* Dropdown máximo de fornecedores */}
          <YStack style={{ zIndex: 3000 }}>
            <Label>Dividir em no máximo</Label>
            <DropDownPicker
              open={open}
              value={dividir_em_maximo}
              items={[
                { label: '2 fornecedores', value: 2 },
                { label: '3 fornecedores', value: 3 },
                { label: '4 fornecedores', value: 4 }
              ]}
              setOpen={setOpen}
              setValue={setDividir_em_maximo}
              multiple={false}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </YStack>

          {/* Bloqueio de fornecedores */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" gap={3} borderRadius="$4" zIndex={2000}>
            <Text fontWeight="bold">Bloquear fornecedores</Text>
            <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
            <Separator my="$3" />
            <Text>Bloquear fornecedores na combinação?</Text>
            <XStack>
              <CustomRadioButton selected={bloquear_fornecedores} onPress={() => setBloquear_fornecedores(true)} label="Sim" />
              <CustomRadioButton selected={!bloquear_fornecedores} onPress={() => setBloquear_fornecedores(false)} label="Não" />
            </XStack>
            {bloquear_fornecedores && (
              <YStack style={{ zIndex: 1000, marginTop: 10 }}>
                <Label>Fornecedores bloqueados</Label>
                <DropDownPicker
                  open={openBlockSuppliers}
                  setOpen={setOpenBlockSupplers}
                  multiple={true}
                  value={fornecedor_bloqueado}
                  setValue={setFornecedor_bloqueado}
                  items={suppliers.map((s) => ({
                    label: s.nomefornecedor,
                    value: s.id
                  }))}
                  placeholder="Selecione os fornecedores"
                  listMode="SCROLLVIEW"
                  translation={{
                    PLACEHOLDER: 'Selecione os fornecedores',
                    SEARCH_PLACEHOLDER: 'Digite para buscar...',
                    NOTHING_TO_SHOW: 'Nada encontrado'
                  }}
                  mode="BADGE"
                  badgeTextStyle={{ color: 'black' }}
                  badgeColors={['#E0E0E0']}
                  badgeDotColors={['#999']}
                  zIndex={1000}
                  zIndexInverse={3000}
                />
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
                  value={preferencia_fornecedor_tipo}
                  setValue={setPreferencia_fornecedor_tipo}
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
              </YStack>

              {preferencia_fornecedor_tipo === 'especifico' && (
                <YStack style={{ zIndex: 1000 }}>
                  <Label>Fornecedores específicos</Label>
                  <DropDownPicker
                    open={openSupplier}
                    setOpen={setOpenSupplier}
                    multiple={true}
                    value={fornecedor_especifico}
                    setValue={setFornecedor_especifico}
                    items={suppliers.map((s) => ({
                      label: s.nomefornecedor,
                      value: s.id
                    }))}
                    placeholder="Selecione os fornecedores"
                    listMode="SCROLLVIEW"
                    translation={{
                      PLACEHOLDER: 'Selecione os fornecedores',
                      SEARCH_PLACEHOLDER: 'Digite para buscar...',
                      NOTHING_TO_SHOW: 'Nada encontrado'
                    }}
                    mode="BADGE"
                    badgeTextStyle={{ color: 'black' }}
                    badgeColors={['#E0E0E0']}
                    badgeDotColors={['#999']}
                    zIndex={1000}
                    zIndexInverse={3000}
                  />
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
                <CustomRadioButton selected={definir_preferencia_produto} onPress={() => setDefinir_preferencia_produto(true)} label="Sim" />
                <CustomRadioButton selected={!definir_preferencia_produto} onPress={() => setDefinir_preferencia_produto(false)} label="Não" />
              </XStack>
              {definir_preferencia_produto && (
                <>
                  {/* Lista de prioridades */}
                  {priorityList.map((number) => (
                    <PrioritySection key={number} priorityNumber={number} products={products} selectedSuppliers={fornecedor_especifico} suppliers={suppliers} onChange={handlePriorityChange} />
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
                onPress={handleSave}
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
              <CustomButton title="Excluir" onPress={handleGoBack} backgroundColor="#f84949ff" textColor="#FFFFFF" borderColor="#A9A9A9" borderWidth={1} />
            </YStack>
            <YStack f={1}>
              <CustomButton title="Salvar" fontSize={10} onPress={handleSave} backgroundColor="#1DC588" textColor="#FFFFFF" borderColor="#A9A9A9" Salvar />
            </YStack>
          </XStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
