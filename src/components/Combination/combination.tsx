import React, { useCallback, useEffect, useState } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, Text, Input, Label, Select, XStack, YStack, Separator, RadioGroup, Button } from 'tamagui'

import CustomButton from '../button/customButton'
import CustomSubtitle from '../subtitle/customSubtitle'
import { PrioritySection } from './prioridade'
import CustomHeader from '../header/customHeader'
import { getAllSuppliers } from '@/src/services/supplierService'
import { mapSuppliers } from '@/app/utils/mapSupplier'
import { CustomRadioButton } from '../button/customRadioButton'
import { getAllProducts, ProductResponse } from '@/src/services/productsService'
import { mapProducts } from '@/app/utils/mapProducts'
import { ProrityProductsCombination } from './prioridade'

export interface SuplierCombination {
  id: string
  nomefornecedor: string
}

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const [combinationName, setCombinationName] = useState('')
  const [maxSuppliers, setMaxSuppliers] = useState('2 fornecedores')
  const [suppliers, setSupplers] = useState<SuplierCombination[]>([])
  const [openBlockSuppliers, setOpenBlockSupplers] = useState(false)
  const [blockSuppliers, setBlockSuppliers] = useState(false)
  const [preference, setPreference] = useState('Qualquer')
  const [specificSuppliers, setSpecificSuppliers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [openSupplier, setOpenSupplier] = useState(false)
  const [openPreference, setOpenPreference] = useState(false)
  const [productPreferenceEnabled, setProductPreferenceEnabled] = useState(false)
  const [priorityList, setPriorityList] = useState<number[]>([1])
  const [products, setProducts] = useState<ProrityProductsCombination[]>([])

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

  const handleSave = () => {
    const combinationData = {
      combinationName,
      maxSuppliers,
      blockSuppliers,
      preference,
      specificSuppliers,
      productPreferenceEnabled
    }
    console.log('Salvando dados da combinação:', combinationData)
    navigation.goBack()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader title="Combinação 1" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt="$2">
          {/* Nome da combinação */}
          <YStack>
            <Label>Nome da combinação</Label>
            <Input placeholder="Lorem ipsum" value={combinationName} onChangeText={setCombinationName} />
          </YStack>

          {/* Dropdown máximo de fornecedores */}
          <YStack style={{ zIndex: 3000 }}>
            <Label>Dividir em no máximo</Label>
            <DropDownPicker
              open={open}
              value={maxSuppliers}
              items={['1 fornecedor', '2 fornecedores', '3 fornecedores'].map((item) => ({
                label: item,
                value: item
              }))}
              setOpen={setOpen}
              setValue={setMaxSuppliers}
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
              <CustomRadioButton selected={blockSuppliers} onPress={() => setBlockSuppliers(true)} label="Sim" />
              <CustomRadioButton selected={!blockSuppliers} onPress={() => setBlockSuppliers(false)} label="Não" />
            </XStack>
            {blockSuppliers && (
              <YStack style={{ zIndex: 1000, marginTop: 10 }}>
                <Label>Fornecedores bloqueados</Label>
                <DropDownPicker
                  open={openBlockSuppliers}
                  setOpen={setOpenBlockSupplers}
                  multiple={true}
                  value={specificSuppliers}
                  setValue={setSpecificSuppliers}
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
                  value={preference}
                  setValue={setPreference}
                  items={[
                    { label: 'Fornecedores melhor avaliados', value: 'Melhor' },
                    { label: 'Fornecedores específicos', value: 'especificos' },
                    { label: 'Qualquer fornecedor', value: 'Qualquer' }
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

              {preference === 'especificos' && (
                <YStack style={{ zIndex: 1000 }}>
                  <Label>Fornecedores específicos</Label>
                  <DropDownPicker
                    open={openSupplier}
                    setOpen={setOpenSupplier}
                    multiple={true}
                    value={specificSuppliers}
                    setValue={setSpecificSuppliers}
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
                <CustomRadioButton selected={productPreferenceEnabled} onPress={() => setProductPreferenceEnabled(true)} label="Sim" />
                <CustomRadioButton selected={!productPreferenceEnabled} onPress={() => setProductPreferenceEnabled(false)} label="Não" />
              </XStack>
              {productPreferenceEnabled && (
                <>
                  {/* Lista de prioridades */}
                  {priorityList.map((number) => (
                    <PrioritySection key={number} priorityNumber={number} products={products} selectedSuppliers={specificSuppliers} suppliers={suppliers} />
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
