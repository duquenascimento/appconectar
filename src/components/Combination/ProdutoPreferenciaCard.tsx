import { YStack, XStack, Input, Button, Text, Separator } from 'tamagui'
import { DropdownCampo } from './DropdownCampo'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import Icons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { useCombinacao } from '@/src/contexts/combinacao.context'

// 🔧 Mock para dropdown de fornecedores
const fornecedoresMock = [
  { label: 'Fornecedor A', value: 'uuid-a' },
  { label: 'Fornecedor B', value: 'uuid-b' },
  { label: 'Fornecedor C', value: 'uuid-c' }
]

const acaoNaFalhaItems = [
  { label: 'Ignorar e pular', value: 'ignorar' },
  { label: 'Indisponível', value: 'indisponivel' }
]

type Props = {
  preferenciaIndex: number
  produtoIndex: number
  produto: {
    produto_sku?: string
    classe?: string
    fornecedores: string[]
    acao_na_falha: 'ignorar' | 'indisponivel'
  }
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

export function ProdutoPreferenciaCard({ preferenciaIndex, produtoIndex, produto, onMoveUp, onMoveDown, onRemove }: Props) {
  const { combinacao, updateCampo } = useCombinacao()
  const [busca, setBusca] = useState('')

  const updateProduto = (field: keyof typeof produto, value: any) => {
    const preferencias = [...(combinacao.preferencias ?? [])]
    const produtos = [...(preferencias[preferenciaIndex].produtos ?? [])]

    produtos[produtoIndex] = {
      ...produtos[produtoIndex],
      [field]: value
    }

    preferencias[preferenciaIndex].produtos = produtos
    updateCampo('preferencias', preferencias)
  }

  const limparBuscaMutua = (tipo: 'sku' | 'classe', valor: string) => {
    if (tipo === 'sku') {
      updateProduto('produto_sku', valor)
      updateProduto('classe', undefined)
    } else {
      updateProduto('classe', valor)
      updateProduto('produto_sku', undefined)
    }
  }

  return (
    <YStack borderWidth={1} borderColor="$gray4" borderRadius="$4" p="$3" gap="$2">
      <Text>Fixar produtos e/ou classes</Text>

      <XStack alignItems="center" gap="$2">
        <Input flex={1} placeholder="Buscar produto ou classe" value={busca} onChangeText={setBusca} />
        <Button
          onPress={() => {
            if (!busca.trim()) return
            const isClasse = busca.toLowerCase().startsWith('classe:')
            const valor = busca.replace(/^classe:/i, '').trim()
            limparBuscaMutua(isClasse ? 'classe' : 'sku', valor)
            setBusca('')
          }}
        >
          <Icons name="search" size={20} />
        </Button>
      </XStack>

      {(produto.produto_sku || produto.classe) && (
        <XStack flexWrap="wrap" gap="$2">
          {produto.produto_sku && (
            <XStack px="$2" py="$1" borderRadius={8} backgroundColor="$gray3" alignItems="center">
              <Text>{produto.produto_sku}</Text>
              <Button size="$1" circular ml="$2" backgroundColor="transparent" onPress={() => updateProduto('produto_sku', undefined)}>
                ×
              </Button>
            </XStack>
          )}
          {produto.classe && (
            <XStack px="$2" py="$1" borderRadius={8} backgroundColor="$gray3" alignItems="center">
              <Text>{produto.classe}</Text>
              <Button size="$1" circular ml="$2" backgroundColor="transparent" onPress={() => updateProduto('classe', undefined)}>
                ×
              </Button>
            </XStack>
          )}
        </XStack>
      )}

      <ContainerSelecaoItems label="Com fornecedor(es)" items={fornecedoresMock} value={produto.fornecedores} onChange={(val) => updateProduto('fornecedores', val)} schemaPath={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].fornecedores`} zIndex={3000} />

      <DropdownCampo campo={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].acao_na_falha`} schemaPath={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].acao_na_falha`} label="Não sendo possível..." items={acaoNaFalhaItems} value={produto.acao_na_falha} onChange={(val) => updateProduto('acao_na_falha', val)} zIndex={2500} />
    </YStack>
  )
}
