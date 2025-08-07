import { YStack, Separator, XStack, Text } from 'tamagui'
import { CustomRadioButton } from '../button/customRadioButton'
import CustomSubtitle from '../subtitle/customSubtitle'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import { useCombinacao } from '@/src/contexts/combinacao.context'

const mockFornecedores = [
  { label: 'Dermale', value: 'd290f1ee-6c54-4b01-90e6-d701748f0851' },
  { label: 'Casanova', value: '79e1fa4f-6a7b-4a8e-b9c2-5ae94a914b22' }
]

export function BloqueioFornecedoresCampo() {
  const { combinacao, updateCampo } = useCombinacao()

  return (
    <YStack borderWidth={1} borderColor="$gray6" p="$4" gap={3} borderRadius="$4" zIndex={2000}>
      <Text fontWeight="bold">Bloquear fornecedores</Text>
      <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
      <Separator my="$3" />
      <Text>Bloquear fornecedores na combinação?</Text>
      <XStack>
        <CustomRadioButton selected={combinacao.bloquear_fornecedores} onPress={() => updateCampo('bloquear_fornecedores', true)} label="Sim" />
        <CustomRadioButton selected={!combinacao.bloquear_fornecedores} onPress={() => updateCampo('bloquear_fornecedores', false)} label="Não" />
      </XStack>

      {combinacao.bloquear_fornecedores && (
        <ContainerSelecaoItems
          label="Fornecedores bloqueados"
          items={mockFornecedores}
          value={combinacao.fornecedores_bloqueados ?? []}
          onChange={(val) => updateCampo('fornecedores_bloqueados', val)}
          schemaPath="fornecedores_bloqueados"
          extraValidationContext={{
            bloquear_fornecedores: combinacao.bloquear_fornecedores
          }}
          zIndex={3000}
        />
      )}
    </YStack>
  )
}
