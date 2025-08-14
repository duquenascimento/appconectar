import { YStack, Separator, XStack, Text } from 'tamagui'
import { CustomRadioButton } from '../button/customRadioButton'
import CustomSubtitle from '../subtitle/customSubtitle'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { useMemo, useState } from 'react'
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert'
import { useSupplier } from '@/src/contexts/fornecedores.context'

export function BloqueioFornecedoresCampo({ error, onChange }: { error?: string; onChange: (val: string[]) => void }) {
  const { combinacao, updateCampo } = useCombinacao()
  const [showModal, setShowModal] = useState(false)

  const { suppliers, unavailableSupplier } = useSupplier()

  const fornecedoresContexto = useMemo(() => {
    const todosFornecedores = [...suppliers, ...unavailableSupplier]
    const fornecedoresClassificados = todosFornecedores.sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))
    return fornecedoresClassificados.map((item) => ({
      label: item.supplier.name,
      value: item.supplier.externalId
    }))
  }, [suppliers, unavailableSupplier])

  const resetFornecedoresBloqueados = () => {
    updateCampo('bloquear_fornecedores', false)
    updateCampo('fornecedores_bloqueados', [])
    setShowModal(false)
  }

  const handleBloquearFornecedores = () => {
    if ((combinacao?.fornecedores_bloqueados || []).length !== 0) {
      setShowModal(true)
    } else {
      updateCampo('bloquear_fornecedores', false)
    }
  }

  return (
    <YStack borderWidth={1} borderColor="$gray6" p="$4" gap={3} borderRadius="$4" zIndex={2000}>
      <TwoButtonCustomAlert visible={showModal} title={'Tem certeza de que quer realizar esta ação?'} message={'Ao fazer isto, os fornecedores selecionados serão removidos'} onConfirm={resetFornecedoresBloqueados} onCancel={() => setShowModal(false)} />

      <Text fontWeight="bold">Bloquear fornecedores</Text>
      <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
      <Separator my="$3" />
      <Text>Bloquear fornecedores na combinação?</Text>
      <XStack>
        <CustomRadioButton selected={combinacao.bloquear_fornecedores} onPress={() => updateCampo('bloquear_fornecedores', true)} label="Sim" />
        <CustomRadioButton selected={!combinacao.bloquear_fornecedores} onPress={handleBloquearFornecedores} label="Não" />
      </XStack>

      {combinacao.bloquear_fornecedores && (
        <ContainerSelecaoItems
          label="Fornecedores bloqueados"
          items={fornecedoresContexto}
          value={Array.isArray(combinacao?.fornecedores_bloqueados) ? combinacao.fornecedores_bloqueados : []}
          onChange={onChange}
          schemaPath="fornecedores_bloqueados"
          extraValidationContext={{
            bloquear_fornecedores: combinacao.bloquear_fornecedores
          }}
          zIndex={4000}
          error={error}
        />
      )}
    </YStack>
  )
}