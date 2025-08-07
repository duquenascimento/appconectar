import { PreferenciaProdutoCard } from './PreferenciaProdutoCard'
import { YStack, Text, Button, Separator } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import { useCombinacao } from '@/src/contexts/combinacao.context'

export function ContainerPreferenciasProduto() {
  const { combinacao, updateCampo } = useCombinacao()

  const preferencias = combinacao.preferencias ?? []

  const adicionarPreferencia = () => {
    const novaPreferencia = {
      ordem: preferencias.length + 1,
      tipo: 'fixar' as const,
      produtos: [
        {
          produto_sku: undefined,
          classe: undefined,
          fornecedores: [],
          acao_na_falha: 'ignorar' as const
        }
      ]
    }

    updateCampo('preferencias', [...preferencias, novaPreferencia])
  }

  const removerPreferencia = (index: number) => {
    const atualizadas = preferencias
      .filter((_, i) => i !== index)
      .map((p, i) => ({
        ...p,
        ordem: i + 1
      }))
    updateCampo('preferencias', atualizadas)
  }

  const moverPreferencia = (from: number, to: number) => {
    if (to < 0 || to >= preferencias.length) return

    const atualizadas = [...preferencias]
    const [item] = atualizadas.splice(from, 1)
    atualizadas.splice(to, 0, item)

    // Atualizar as ordens
    const reordenadas = atualizadas.map((p, i) => ({
      ...p,
      ordem: i + 1
    }))
    updateCampo('preferencias', reordenadas)
  }

  return (
    <YStack gap="$4" mt="$4">
      <Text fontSize="$6" fontWeight="bold">
        Definir preferência de produtos para um ou mais fornecedores?
      </Text>

      <Separator />

      {preferencias.map((_, index) => (
        <PreferenciaProdutoCard key={index} index={index} onRemove={() => removerPreferencia(index)} onMoveUp={() => moverPreferencia(index, index - 1)} onMoveDown={() => moverPreferencia(index, index + 1)} />
      ))}

      <Button mt="$2" onPress={adicionarPreferencia}>
        <Icons name="add" size={20} />
        Adicionar Produto
      </Button>
    </YStack>
  )
}
