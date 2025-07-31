import { getAllProducts, ProductResponse } from '@/src/services/productsService'
import React, { useEffect, useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { View, Text, XStack, YStack, Separator, Card, Label } from 'tamagui'
import { SuplierCombination } from './combination'

export interface ProrityProductsCombination {
  id: string
  sku: string
  name: string
  class: string
}
interface PrioritySectionProps {
  priorityNumber: number
  products: ProrityProductsCombination[]
  selectedSuppliers: string[]
  suppliers: SuplierCombination[]
  onChange: (
    priorityNumber: number,
    data: {
      tipo: string
      produtos: {
        produto_sku: string
        classe: string
        fornecedores: string[]
        acao_na_falha: string
      }[]
    }
  ) => void
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({ priorityNumber, products, selectedSuppliers, suppliers, onChange }) => {
  const [euQueroOpen, setEuQueroOpen] = useState(false)
  const [euQueroValue, setEuQueroValue] = useState('fixar')
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

    onChange(priorityNumber, {
      tipo: euQueroValue,
      produtos: produtosFormatados
    })
  }, [euQueroValue, specificProducts, fornecedorValue, acao_na_falha])

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
        value: `classe-${className}`
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
          <Text fontSize="$7">Prioridade {priorityNumber}</Text>
        </XStack>

        {/* Descrição */}
        <View mb={'$2'}>
          <Label fontSize={'$6'}>Eu quero</Label>
          <DropDownPicker
            open={euQueroOpen}
            value={euQueroValue}
            items={[
              { label: 'Fixar produtos por fornecedor', value: 'fixar' },
              { label: 'Remover produtos por fornecedor', value: 'remover' }
            ]}
            setOpen={setEuQueroOpen}
            setValue={setEuQueroValue}
            multiple={false}
            zIndex={3000}
            zIndexInverse={1000}
            placeholder="Selecione uma opção"
            placeholderStyle={{ color: 'gray' }}
          />
        </View>

        {euQueroValue === 'fixar' && (
          <YStack>
            <Label>Buscar produtos</Label>
            <DropDownPicker
              dropDownDirection="BOTTOM"
              open={openProducts}
              setOpen={setOpenProducts}
              multiple={true}
              value={specificProducts}
              setValue={setSpecificProducts}
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
              mode="BADGE"
              badgeTextStyle={{ color: 'black' }}
              badgeColors={['#E0E0E0']}
              badgeDotColors={['#999']}
              zIndex={30}
              zIndexInverse={10}
            />
          </YStack>
        )}
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
            setValue={setFornecedorValue}
            zIndex={20}
            zIndexInverse={10}
            placeholder="Selecione o fornecedor"
            placeholderStyle={{ color: 'gray' }}
            translation={{
              PLACEHOLDER: 'Selecione os fornecedores',
              SEARCH_PLACEHOLDER: 'Digite para buscar...',
              NOTHING_TO_SHOW: 'Nada encontrado',
              SELECTED_ITEMS_COUNT_TEXT: '{count} fornecedor(es) selecionado(s)'
            }}
          />
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
      </YStack>
    </Card>
  )
}
