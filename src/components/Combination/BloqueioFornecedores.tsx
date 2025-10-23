import { YStack, Separator, XStack, Text } from 'tamagui'
import { CustomRadioButton } from '../button/customRadioButton'
import CustomSubtitle from '../subtitle/customSubtitle'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { useEffect, useMemo, useState } from 'react'
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert'
import { useSupplier } from '@/src/contexts/fornecedores.context'

export function BloqueioFornecedoresCampo({ error, onChange }: { error?: string; onChange: (val: string[]) => void }) {
  const { combinacao, updateCampo } = useCombinacao()
  const [showModal, setShowModal] = useState(false)

  const { suppliers, unavailableSupplier } = useSupplier()

  const [selectFornecedoresContextoBloq, setSelectFornecedoresContextoBloq] = useState<{label: string, value: string}[]>([])

  const fornecedoresContexto = useMemo(() => {
    const todosFornecedores = [...suppliers, ...unavailableSupplier]

    const fornecedoresNaoSelecionados = todosFornecedores.filter(
      (item) => !combinacao.fornecedores_especificos?.includes(item.supplier.externalId)
    )

    const fornecedoresClassificados = fornecedoresNaoSelecionados.sort((a, b) => 
      a.supplier.name.localeCompare(b.supplier.name)
    )

    return fornecedoresClassificados.map((item) => ({
      label: item.supplier.name,
      value: item.supplier.externalId
    }))
  }, [suppliers, unavailableSupplier, combinacao.fornecedores_especificos])

  const resetFornecedoresBloqueados = () => {
    updateCampo('bloquear_fornecedores', false)
    updateCampo('fornecedores_bloqueados', [])
    setShowModal(false)
  }

  // Função que adiciona um 'check' ao lado do nome do fornecedor selecionado
    const updateFornecedorLabel = (value: string) => {
      setSelectFornecedoresContextoBloq(prevState => {
        return prevState.map(obj => {
          if(obj.value === value)
            return {...obj, label: `${obj.label} 🚫`}
          return obj
        })
      })
    }
  
    useEffect(() => {
      // Array com todos os campos já selecionados para a combinação
      const combinacaoArray = Array.isArray(combinacao?.fornecedores_bloqueados) ? combinacao.fornecedores_bloqueados : [];
  
      // Atualiza as opções do select de 'Fornecedores Específicos'
      setSelectFornecedoresContextoBloq(fornecedoresContexto);
  
      // Caso um fornecedor específico seja selecionado, altera seu nome para mostrar um 'check' do lado
      if(combinacaoArray.length > 0){
        fornecedoresContexto.forEach(fornecedorLabel => {
          combinacaoArray.forEach(combinacaoIndexValue => {
            if(fornecedorLabel.value == combinacaoIndexValue)
              updateFornecedorLabel(combinacaoIndexValue)
          })
        });
      }
    }, [combinacao])

  const handleBloquearFornecedores = () => {
    if ((combinacao?.fornecedores_bloqueados || []).length !== 0) {
      setShowModal(true)
    } else {
      updateCampo('bloquear_fornecedores', false)
    }
  }

  return (
    <YStack borderWidth={1} borderColor="$gray6" padding="$4" gap={3} borderRadius="$4" zIndex={2000}>
      <TwoButtonCustomAlert visible={showModal} title={'Tem certeza de que quer realizar esta ação?'} message={'Ao fazer isto, os fornecedores selecionados serão removidos'} onConfirm={resetFornecedoresBloqueados} onCancel={() => setShowModal(false)} />

      <Text fontWeight="bold">Bloquear fornecedores</Text>
      <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
      <Separator marginVertical="$3" />
      <Text>Bloquear fornecedores na combinação?</Text>
      <XStack>
        <CustomRadioButton selected={combinacao.bloquear_fornecedores} onPress={() => updateCampo('bloquear_fornecedores', true)} label="Sim" />
        <CustomRadioButton selected={!combinacao.bloquear_fornecedores} onPress={handleBloquearFornecedores} label="Não" />
      </XStack>

      {combinacao.bloquear_fornecedores && (
        <ContainerSelecaoItems
          label="Fornecedores bloqueados"
          items={selectFornecedoresContextoBloq}
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