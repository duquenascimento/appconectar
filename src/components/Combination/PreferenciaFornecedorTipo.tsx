// components/form/PreferenciaFornecedorCampo.tsx
import { YStack, Separator, Text } from 'tamagui'
import CustomSubtitle from '../subtitle/customSubtitle'
import { DropdownCampo } from './DropdownCampo'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { TipoFornecedor } from '@/src/types/combinationTypes'
import { useState } from 'react'
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert'

const mockFornecedores = [
  { label: 'Fornecedor 1', value: 'd290f1ee-6c54-4b01-90e6-d701748f0851' },
  { label: 'Fornecedor 2', value: '79e1fa4f-6a7b-4a8e-b9c2-5ae94a914b22' },
  { label: 'Fornecedor 3', value: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }
]

const tipoFornecedorItems = [
  { label: 'Qualquer', value: 'qualquer' },
  { label: 'Melhor avaliado', value: 'melhor_avaliado' },
  { label: 'Específico', value: 'especifico' }
]

export function PreferenciaFornecedorCampo() {
  const { combinacao, updateCampo } = useCombinacao()
  const [showModal, setShowModal] = useState(false)
  const [tipoTemporario, setTipoTemporario] = useState<TipoFornecedor | null>(null)

  const resetarPreferenciaFornecedor = () => {
    if (!tipoTemporario) return

    updateCampo('preferencia_fornecedor_tipo', tipoTemporario)
    updateCampo('definir_preferencia_produto', false)
    updateCampo('preferencias', [])
    updateCampo('fornecedores_especificos', [])
    setTipoTemporario(null)
    setShowModal(false)
  }

  const handleFornecedorTipo = (value: TipoFornecedor) => {
    const vaiDeixarDeSerEspecifico = combinacao.preferencia_fornecedor_tipo === 'especifico' && value !== 'especifico'
    const haDados = (combinacao.preferencias?.length ?? 0) > 0 || (combinacao.fornecedores_especificos?.length ?? 0) > 0

    if (vaiDeixarDeSerEspecifico && haDados) {
      setTipoTemporario(value)
      setShowModal(true)
    } else {
      updateCampo('preferencia_fornecedor_tipo', value)
    }
  }

  return (
    <YStack borderWidth={1} borderColor="$gray6" p="$4" gap={3} borderRadius="$4" zIndex={2000}>
      <TwoButtonCustomAlert
        visible={showModal}
        title={'Tem certeza de que quer realizar esta ação?'}
        message={'Ao fazer isto, os fornecedores específicos e preferências selecionados serão removidos'}
        onConfirm={resetarPreferenciaFornecedor}
        onCancel={() => {
          setTipoTemporario(null)
          setShowModal(false)
        }}
      />
      <Text fontWeight="bold">Preferência de fornecedor</Text>
      <CustomSubtitle>Escolha como os fornecedores serão priorizados na combinação</CustomSubtitle>
      <Separator my="$3" />

      <DropdownCampo
        campo="preferencia_fornecedor_tipo"
        label="Tipo de preferência"
        items={tipoFornecedorItems}
        value={combinacao.preferencia_fornecedor_tipo ?? 'qualquer'}
        // onChange={(val) => updateCampo('preferencia_fornecedor_tipo', val as TipoFornecedor)}
        onChange={(val) => handleFornecedorTipo(val)}
        zIndex={3000}
      />

      {combinacao.preferencia_fornecedor_tipo === 'especifico' && (
        <ContainerSelecaoItems
          label="Fornecedores específicos"
          items={mockFornecedores}
          value={combinacao.fornecedores_especificos ?? []}
          onChange={(val) => updateCampo('fornecedores_especificos', val)}
          schemaPath="fornecedores_especificos"
          extraValidationContext={{
            preferencia_fornecedor_tipo: combinacao.preferencia_fornecedor_tipo
          }}
          zIndex={2000}
        />
      )}
    </YStack>
  )
}
