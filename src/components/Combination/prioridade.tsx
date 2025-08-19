import { getAllProducts, ProductResponse } from '@/src/services/productsService'
import React, { useEffect, useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { View, Text, XStack, YStack, Separator, Card, Label, Button } from 'tamagui'
import { SuplierCombination } from './combination'
import { getIn, useFormikContext } from 'formik'
import { getFieldError } from '@/app/utils/formikUtils'

export interface ProrityProductsCombination {
  id: string
  sku: string
  name: string
  class: string
}
interface PrioritySectionProps {
  index: number
  products: ProrityProductsCombination[]
  selectedSuppliers: string[]
  suppliers: SuplierCombination[]
  onRemove?: () => void
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({ index, products, selectedSuppliers, suppliers, onRemove }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>()
  const prefix = `preferencias[${index}]`

  const tipoError = getFieldError(`${prefix}.tipo`, touched, errors)
  const produtosError = getFieldError(`${prefix}.produtos`, touched, errors)

  const [euQueroOpen, setEuQueroOpen] = useState(false)
  const [fornecedorOpen, setFornecedorOpen] = useState(false)
  const [fornecedorValue, setFornecedorValue] = useState<string[]>([])
  const [naoPossivelOpen, setNaoPossivelOpen] = useState(false)
  const [acao_na_falha, setAcao_na_falha] = useState('ignorar')
  const [openProducts, setOpenProducts] = useState(false)
  const [specificProducts, setSpecificProducts] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [itemsDropdown, setItemsDropdown] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    const produtosFormatados = specificProducts.map((productId) => {
      const produtoInfo = products.find((p) => p.id === productId)

      return {
        produto_sku: produtoInfo?.sku ?? '',
        classe: produtoInfo?.class ?? '',
        fornecedores: fornecedorValue,
        acao_na_falha: acao_na_falha
      }
    })

    setFieldValue(`${prefix}.produtos`, produtosFormatados)
  }, [specificProducts, fornecedorValue, acao_na_falha])

  const selectedSupplierOptions = suppliers
    .filter((s) => selectedSuppliers.includes(s.id))
    .map((s) => ({
      label: s.nomefornecedor,
      value: s.id
    }))

  useEffect(() => {
    const fetch = async () => {
      const all: ProductResponse[] = await getAllProducts()
      const text = searchText.toLowerCase()

      const matchedProducts = all
        .filter((product: ProductResponse) => product.name.toLowerCase().includes(text))
        .map((p) => ({
          label: `${p.name}`,
          value: p.id
        }))

      const matchedClasses = all.filter((product: ProductResponse) => product.class.toLowerCase().includes(text))

      const classOptions = [...new Set(matchedClasses.map((p) => p.class.toLocaleUpperCase()))].map((className) => ({
        label: `${className}`,
        value: `${className}`
      }))

      setItemsDropdown([...matchedProducts, ...classOptions])
    }

    if (searchText.length > 0) {
      fetch()
    } else {
      getAllProducts().then((all) => {
        const preview = all.slice(0, 10).map((p) => ({
          label: `${p.name}`,
          value: p.id
        }))
        setItemsDropdown(preview)
      })
    }
  }, [searchText])

  return (
    <Card bordered backgroundColor="white" borderColor="$gray5" p="$2" my="$4">
      <YStack gap="$3" p="$2">
        {/* Cabeçalho Prioridade */}
        <XStack alignItems="center" borderBottomWidth={1} pb={'$4'}>
          <Text fontSize="$7">Prioridade {index + 1}</Text>
        </XStack>

        {/* Descrição */}
        <View mb={'$2'}>
          <Label fontSize={'$6'}>Eu quero</Label>
          <DropDownPicker
            open={euQueroOpen}
            value={values.preferencias[index].tipo}
            items={[
              { label: 'Fixar produtos por fornecedor', value: 'fixar' },
              { label: 'Remover produtos por fornecedor', value: 'remover' }
            ]}
            setOpen={setEuQueroOpen}
            setValue={(val) => setFieldValue(`${prefix}.tipo`, val())}
            multiple={false}
            zIndex={3000}
            zIndexInverse={1000}
            placeholder="Selecione uma opção"
            placeholderStyle={{ color: 'gray' }}
          />
          {tipoError && <Text color="red">{tipoError}</Text>}
        </View>
        <YStack>
          <Label>Buscar produtos</Label>
          <DropDownPicker
            dropDownDirection="BOTTOM"
            open={openProducts}
            setOpen={setOpenProducts}
            multiple={true}
            value={specificProducts}
            setValue={(items) => {
              setSpecificProducts(items)
              setTimeout(() => setOpenProducts(false), 200)
            }}
            items={itemsDropdown}
            onChangeSearchText={setSearchText}
            placeholder="Digite o nome do produto ou classe..."
            searchable={true}
            searchPlaceholder="Digite para buscar..."
            searchTextInputProps={{
              autoCorrect: false
            }}
            listMode="SCROLLVIEW"
            translation={{
              PLACEHOLDER: 'Digite o nome do produto ou classe...',
              SEARCH_PLACEHOLDER: 'Digite para buscar...',
              NOTHING_TO_SHOW: 'Nenhum produto encontrado'
            }}
            zIndex={30}
            zIndexInverse={10}
          />
          {specificProducts.length > 0 && (
            <YStack mt="$2" p="$2" borderWidth={1} borderRadius={8} borderColor="$gray5" gap="$2">
              <Text>Produtos selecionados:</Text>
              <XStack flexWrap="wrap" gap="$2">
                {specificProducts.map((id) => {
                  const label = itemsDropdown.find((s) => s.value === id)?.label ?? id
                  return (
                    <XStack key={id} borderRadius={6} px="$2" py="$1" alignItems="center" gap="$1" backgroundColor="#E0E0E0">
                      <Button
                        size="$1"
                        circular
                        backgroundColor="transparent"
                        fontSize={'22px'}
                        color={'#777'}
                        onPress={() => {
                          const updated = specificProducts.filter((item) => item !== id)
                          setSpecificProducts(updated)
                          setFieldValue(`${prefix}.produtos`, updated)
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
          {produtosError && <Text color="red">{produtosError}</Text>}
        </YStack>
        <Separator borderColor="$gray5" />

        {/* Com fornecedor(es) */}
        <View my={'$2'}>
          <Label>Com fornecedor(es)</Label>
          <DropDownPicker
            open={fornecedorOpen}
            multiple={true}
            value={fornecedorValue}
            items={selectedSupplierOptions}
            setOpen={setFornecedorOpen}
            setValue={(items) => {
              setFornecedorValue(items)
              setTimeout(() => setFornecedorOpen(false), 200)
            }}
            zIndex={20}
            zIndexInverse={10}
            placeholder="Selecione o fornecedor"
            placeholderStyle={{ color: 'gray' }}
          />
          {fornecedorValue.length > 0 && (
            <YStack mt="$2" p="$2" borderWidth={1} borderRadius={8} borderColor="$gray5" gap="$2">
              <Text>Fornecedores específicos selecionados:</Text>
              <XStack flexWrap="wrap" gap="$2">
                {fornecedorValue.map((id) => {
                  const label = selectedSupplierOptions.find((s) => s.value === id)?.label ?? id
                  return (
                    <XStack key={id} borderRadius={6} px="$2" py="$1" alignItems="center" gap="$1" backgroundColor="#E0E0E0">
                      <Button
                        size="$1"
                        circular
                        backgroundColor="transparent"
                        fontSize={'22px'}
                        color={'#777'}
                        onPress={() => {
                          const updated = fornecedorValue.filter((item) => item !== id)
                          setFornecedorValue(updated)
                          setFieldValue('fornecedores_especificos', updated)
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
        </View>

        <Separator borderColor="$gray5" />

        {/* Não sendo possível */}
        <View my={'$2'}>
          <Label>Não sendo possível</Label>
          <DropDownPicker
            open={naoPossivelOpen}
            value={acao_na_falha}
            items={[
              { label: 'Ignorar e pular esta preferência', value: 'ignorar' },
              { label: 'Deixar produto como indisponível', value: 'indisponivel' }
            ]}
            setOpen={setNaoPossivelOpen}
            setValue={setAcao_na_falha}
            multiple={false}
            zIndex={10}
            zIndexInverse={10}
            placeholder="Selecione uma ação"
            placeholderStyle={{ color: 'gray' }}
          />
        </View>
        {onRemove && (
          <Button
            alignSelf="center"
            width="50%"
            onPress={onRemove}
            hoverStyle={{
              backgroundColor: '#f84949',
              opacity: 0.8
            }}
            backgroundColor="#f84949"
            color="#fff"
          >
            Descartar preferência
          </Button>
        )}
      </YStack>
    </Card>
  )
}
