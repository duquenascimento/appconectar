import { YStack, Separator, Text } from 'tamagui'
import CustomSubtitle from '../subtitle/customSubtitle'
import { DropdownCampo } from './DropdownCampo'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { TipoFornecedor } from '@/src/types/combinationTypes'
import { useMemo, useState } from 'react'
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert'
import { useSupplier } from '@/src/contexts/fornecedores.context'
import CustomAlert from '../modais/CustomAlert'

const tipoFornecedorItems = [
  { label: 'Qualquer', value: 'qualquer' },
  { label: 'Específico', value: 'especifico' }
]

export function PreferenciaFornecedorCampo({ error, onChange }: { error?: string; onChange: (val: string[]) => void }) {
  const { combinacao, updateCampo } = useCombinacao()
  const [showModal, setShowModal] = useState(false)
  const [showValidationAlert, setShowValidationAlert] = useState(false)
  const [tipoTemporario, setTipoTemporario] = useState<TipoFornecedor | null>(null)
  const [ignorarValidacao, setIgnorarValidacao] = useState(false)

  const { suppliers, unavailableSupplier } = useSupplier()

  const fornecedoresContexto = useMemo(() => {
    const todosFornecedores = [...suppliers, ...unavailableSupplier]

    const fornecedoresNaoBloqueados = todosFornecedores.filter((item) => !combinacao.fornecedores_bloqueados?.includes(item.supplier.externalId))
    const fornecedoresClassificados = fornecedoresNaoBloqueados.sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))

    return fornecedoresClassificados.map((item) => ({
      label: item.supplier.name,
      value: item.supplier.externalId
    }))
  }, [suppliers, unavailableSupplier, combinacao.fornecedores_bloqueados])

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
    if (value === 'especifico' && combinacao.dividir_em_maximo < 2) {
      setShowValidationAlert(true)
      return
    }

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
    <YStack borderWidth={1} borderColor="$gray6" p="$4" gap={3} borderRadius="$4" zIndex={1000}>
      <CustomAlert
        visible={showValidationAlert}
        title="Atenção!"
        message="Selecione a quantidade de fornecedores para dividir antes de escolher a preferência de fornecedor."
        onConfirm={() => setShowValidationAlert(false)}
      />
      <TwoButtonCustomAlert
        visible={showModal}
        title={'Tem certeza de que quer realizar esta ação?'}
        message={'Ao fazer isto, os fornecedores específicos e preferências selecionados serão removidos'}
        onConfirm={() => {
          setIgnorarValidacao(false) 
          resetarPreferenciaFornecedor()
        }}
        onCancel={() => {
          setIgnorarValidacao(true)
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
        onChange={(val) => handleFornecedorTipo(val as TipoFornecedor)}
        zIndex={4000}
      />
      {combinacao.preferencia_fornecedor_tipo === 'especifico' && (
        <ContainerSelecaoItems
          label="Fornecedores específicos"
          items={fornecedoresContexto}
          value={Array.isArray(combinacao?.fornecedores_especificos) ? combinacao.fornecedores_especificos : []}
          onChange={onChange}
          onRemove={(item) => {
            const fornecedoresAtuais = combinacao.fornecedores_especificos ?? []
            if (fornecedoresAtuais.length === 1) {
              setIgnorarValidacao(true)
              setTipoTemporario(combinacao.preferencia_fornecedor_tipo ?? null)
              setShowModal(true)
            } else {
              // Remove normalmente
              const updated = fornecedoresAtuais.filter((v) => v !== item)
              updateCampo('fornecedores_especificos', updated)
            }
          }}
          schemaPath="fornecedores_especificos"
          extraValidationContext={{
            preferencia_fornecedor_tipo: combinacao.preferencia_fornecedor_tipo
          }}
          zIndex={2000}
          error={error}
          ignoreValidation={ignorarValidacao}
        />
      )}
    </YStack>
  )
}