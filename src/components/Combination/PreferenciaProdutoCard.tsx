import { YStack, XStack, Text, Button, Separator } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import { DropdownCampo } from './DropdownCampo'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { ProdutoPreferenciaCard } from './ProdutoPreferenciaCard'
import { AcaoNaFalha } from '@/src/types/combinationTypes'
import { updatePreferencia } from '@/app/utils/preferenciaUtils'

type Props = {
  index: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

const tipoProdutoItems = [
  { label: 'Fixar produtos por fornecedor', value: 'fixar' },
  { label: 'Remover produtos por fornecedor', value: 'remover' }
]

export function PreferenciaProdutoCard({ index, onMoveUp, onMoveDown, onRemove }: Props) {
  const { combinacao, updateCampo } = useCombinacao()
  const preferencia = combinacao.preferencias?.[index]

  if (!preferencia) return null

  const atualizarCampoLocal = (key: keyof typeof preferencia, value: any) => {
    const novaCombinacao = updatePreferencia(combinacao, index, {
      ...preferencia,
      [key]: value
    })
    updateCampo('preferencias', novaCombinacao.preferencias)
  }

  const adicionarProduto = () => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])]
    novasPreferencias[index].produtos.push({
      produto_sku: undefined,
      classe: undefined,
      fornecedores: [],
      acao_na_falha: AcaoNaFalha.IGNORAR
    })
    updateCampo('preferencias', novasPreferencias)
  }

  const updateProduto = (field: keyof typeof produto, value: any) => {
  updateCampo('preferencias', (prevPreferencias: any[]) => {
    const novasPreferencias = [...prevPreferencias]
    const preferenciaAtual = { ...novasPreferencias[preferenciaIndex] }
    const produtosAtualizados = [...preferenciaAtual.produtos]

    produtosAtualizados[produtoIndex] = {
      ...produtosAtualizados[produtoIndex],
      [field]: value ?? undefined
    }

    preferenciaAtual.produtos = produtosAtualizados
    novasPreferencias[preferenciaIndex] = preferenciaAtual

    return novasPreferencias
  })
}


  const removerProduto = (produtoIndex: number) => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])]
    novasPreferencias[index].produtos = novasPreferencias[index].produtos.filter((_, i) => i !== produtoIndex)
    updateCampo('preferencias', novasPreferencias)
  }

  const moverProduto = (from: number, to: number) => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])]
    const produtos = [...novasPreferencias[index].produtos]
    const item = produtos.splice(from, 1)[0]
    produtos.splice(to, 0, item)
    novasPreferencias[index].produtos = produtos
    updateCampo('preferencias', novasPreferencias)
  }

  return (
    <YStack borderWidth={1} borderColor="$gray6" borderRadius="$4" p="$4" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold">Prioridade {index + 1}</Text>
        <XStack gap="$2">
          <Button onPress={onMoveUp} size="$2">
            <Icons name="chevron-up" size={20} />
          </Button>
          <Button onPress={onMoveDown} size="$2">
            <Icons name="chevron-down" size={20} />
          </Button>
          <Button onPress={onRemove} size="$2">
            <Icons name="trash" size={20} />
          </Button>
        </XStack>
      </XStack>

      <Separator />

      <DropdownCampo campo={`preferencias[${index}].tipo`} label="Eu quero..." items={tipoProdutoItems} value={preferencia.tipo} onChange={(val) => atualizarCampoLocal('tipo', val)} schemaPath={`preferencias[${index}].tipo`} zIndex={3000} />

      {preferencia.produtos.map((produto, produtoIndex) => (
        <ProdutoPreferenciaCard key={produtoIndex} preferenciaIndex={index} produtoIndex={produtoIndex} produto={produto} onRemove={() => removerProduto(produtoIndex)} onMoveUp={() => produtoIndex > 0 && moverProduto(produtoIndex, produtoIndex - 1)} onMoveDown={() => produtoIndex < preferencia.produtos.length - 1 && moverProduto(produtoIndex, produtoIndex + 1)} />
      ))}
    </YStack>
  )
}
