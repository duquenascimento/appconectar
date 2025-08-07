import { YStack, Button, Text } from 'tamagui'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { TipoProduto } from '@/src/types/combinationTypes'
import { PreferenciaProdutoCard } from './PreferenciaProdutoCard'

export function PreferenciasProdutoCampo() {
  const { combinacao, updateCampo } = useCombinacao()

  const podeMostrar = combinacao.preferencia_fornecedor_tipo === 'especifico' && combinacao.definir_preferencia_produto === true

  const handleAddPreferencia = () => {
    const novaPreferencia = {
      ordem: (combinacao.preferencias?.length ?? 0) + 1,
      tipo: TipoProduto.FIXAR,
      produtos: []
    }

    updateCampo('preferencias', [...(combinacao.preferencias ?? []), novaPreferencia])
  }

  if (!podeMostrar) return null

  return (
    <YStack gap="$3">
      <Text fontWeight="bold">Preferências de Produto</Text>
      {(combinacao.preferencias ?? []).map((pref, index) => (
        <PreferenciaProdutoCard key={index} index={index} preferencia={pref} />
      ))}
      <Button onPress={handleAddPreferencia}>Adicionar preferência</Button>
    </YStack>
  )
}
