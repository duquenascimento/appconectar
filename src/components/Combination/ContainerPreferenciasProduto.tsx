import { PreferenciaProdutoCard } from './PreferenciaProdutoCard'
import { YStack, Text, Button, Separator, XStack } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { CustomRadioButton } from '../button/customRadioButton'
import { useEffect, useState } from 'react'
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert'
import { resetarPreferencias } from '@/app/utils/preferenciaUtils'

export function ContainerPreferenciasProduto() {
  const { combinacao, updateCampo } = useCombinacao()
  const [showModal, setShowModal] = useState(false)

  const preferencias = combinacao.preferencias ?? []

  const resetPreferencias = () => {
    const atualizar = resetarPreferencias(combinacao)
    updateCampo('definir_preferencia_produto', atualizar.definir_preferencia_produto)
    updateCampo('preferencias', atualizar.preferencias)
    setShowModal(false)
  }

  useEffect(() => {}, [showModal])

  const handleDefinirPreferencias = () => {
    if (preferencias.length !== 0) {
      setShowModal(true)
    } else {
      updateCampo('definir_preferencia_produto', false)
    }
  }

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

    const reordenadas = atualizadas.map((p, i) => ({
      ...p,
      ordem: i + 1
    }))
    updateCampo('preferencias', reordenadas)
  }

  return (
    <YStack gap="$4" mt="$4">
      <TwoButtonCustomAlert visible={showModal} title={'Tem certeza de que quer realizar esta ação?'} message={'Ao fazer isto, as preferências de produto serão removidas'} onConfirm={resetPreferencias} onCancel={() => setShowModal(false)} />

      <Text fontSize="$6" fontWeight="bold">
        Definir preferência de produtos para um ou mais fornecedores?
      </Text>
      <XStack>
        <CustomRadioButton selected={combinacao.definir_preferencia_produto} onPress={() => updateCampo('definir_preferencia_produto', true)} label="Sim" />
        <CustomRadioButton selected={!combinacao.definir_preferencia_produto} onPress={handleDefinirPreferencias} label="Não" />
      </XStack>

      <Separator />

      {combinacao.definir_preferencia_produto && preferencias.map((_, index) => <PreferenciaProdutoCard key={index} index={index} onRemove={() => removerPreferencia(index)} onMoveUp={() => moverPreferencia(index, index - 1)} onMoveDown={() => moverPreferencia(index, index + 1)} />)}

      {combinacao.definir_preferencia_produto && (
        <Button mt="$2" onPress={adicionarPreferencia}>
          <Icons name="add" size={20} />
          Adicionar Produto
        </Button>
      )}
    </YStack>
  )
}
