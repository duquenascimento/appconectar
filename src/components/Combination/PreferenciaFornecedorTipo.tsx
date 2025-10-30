import { useEffect, useMemo, useState } from 'react';
import { YStack, Separator, Text, XStack, Switch } from 'tamagui';
import CustomSubtitle from '../subtitle/customSubtitle';
import { DropdownCampo } from './DropdownCampo';
import { ContainerSelecaoItems } from './ContainerSelecaoItems';
import { useCombinacao } from '@/src/contexts/combinacao.context';
import { TipoFornecedor } from '../../types/combinationTypes';
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert';
import { useSupplier } from '@/src/contexts/fornecedores.context';
import CustomAlert from '../modais/CustomAlert';

const tipoFornecedorItems = [
  { label: 'Qualquer', value: 'qualquer' },
  { label: 'Específico', value: 'especifico' },
];

export function PreferenciaFornecedorCampo({
  error,
  onChange,
}: {
  error?: string;
  onChange: (val: string[]) => void;
}) {
  const { combinacao, updateCampo } = useCombinacao();
  const [showModal, setShowModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [tipoTemporario, setTipoTemporario] = useState<TipoFornecedor | null>(null);
  const [ignorarValidacao, setIgnorarValidacao] = useState(false);
  const [selectFornecedoresContexto, setSelectFornecedoresContexto] = useState<
    { label: string; value: string }[]
  >([]);

  const { suppliers, unavailableSupplier } = useSupplier();

  const fornecedoresContexto = useMemo(() => {
    const todosFornecedores = [...suppliers, ...unavailableSupplier];

    const fornecedoresNaoBloqueados = todosFornecedores.filter(
      (item) => !combinacao.fornecedores_bloqueados?.includes(item.supplier.externalId),
    );
    const fornecedoresClassificados = fornecedoresNaoBloqueados.sort((a, b) =>
      a.supplier.name.localeCompare(b.supplier.name),
    );

    return fornecedoresClassificados.map((item) => ({
      label: item.supplier.name,
      value: item.supplier.externalId,
    }));
  }, [suppliers, unavailableSupplier, combinacao.fornecedores_bloqueados]);

  const updateFornecedorLabel = (value: string) => {
    setSelectFornecedoresContexto((prevState) => {
      return prevState.map((obj) => {
        if (obj.value === value) return { ...obj, label: `${obj.label} ✅` };
        return obj;
      });
    });
  };

  useEffect(() => {
    const combinacaoArray = Array.isArray(combinacao?.fornecedores_especificos)
      ? combinacao.fornecedores_especificos
      : [];

    setSelectFornecedoresContexto(fornecedoresContexto);

    if (combinacaoArray.length > 0) {
      fornecedoresContexto.forEach((fornecedorLabel) => {
        combinacaoArray.forEach((combinacaoIndexValue) => {
          if (fornecedorLabel.value == combinacaoIndexValue)
            updateFornecedorLabel(combinacaoIndexValue);
        });
      });
    }
  }, [combinacao]);

  const resetarPreferenciaFornecedor = () => {
    if (!tipoTemporario) return;

    updateCampo('preferencia_fornecedor_tipo', tipoTemporario);
    updateCampo('definir_preferencia_produto', false);
    updateCampo('preferencias', []);
    updateCampo('fornecedores_especificos', []);
    setTipoTemporario(null);
    setShowModal(false);
  };

  const handleFornecedorTipo = (value: boolean) => {
    if (combinacao.dividir_em_maximo < 2) {
      setShowValidationAlert(true);
      return;
    }

    const fornecedorTipo = value ? TipoFornecedor.ESPECIFICO : TipoFornecedor.QUALQUER;
    const vaiDeixarDeSerEspecifico =
      combinacao.preferencia_fornecedor_tipo === 'especifico' && fornecedorTipo !== 'especifico';
    const haDados =
      (combinacao.preferencias?.length ?? 0) > 0 ||
      (combinacao.fornecedores_especificos?.length ?? 0) > 0;

    if (vaiDeixarDeSerEspecifico && haDados) {
      setTipoTemporario(fornecedorTipo);
      setShowModal(true);
    } else {
      updateCampo('preferencia_fornecedor_tipo', fornecedorTipo);
    }
  };

  return (
    <YStack
      borderWidth={1}
      borderColor="$gray6"
      padding="$4"
      gap={3}
      borderRadius="$4"
      zIndex={1000}
    >
      <CustomAlert
        visible={showValidationAlert}
        title="Atenção!"
        message="Selecione a quantidade de fornecedores para dividir antes de escolher a preferência de fornecedor."
        onConfirm={() => setShowValidationAlert(false)}
      />
      <TwoButtonCustomAlert
        visible={showModal}
        title={'Tem certeza de que quer realizar esta ação?'}
        message={
          'Ao fazer isto, os fornecedores específicos e preferências selecionados serão removidos'
        }
        onConfirm={() => {
          setIgnorarValidacao(false);
          resetarPreferenciaFornecedor();
        }}
        onCancel={() => {
          setIgnorarValidacao(true);
          setTipoTemporario(null);
          setShowModal(false);
        }}
      />
      <Separator marginHorizontal="$3" />

      <XStack justifyContent="space-between" alignItems="center">
        <YStack flexShrink={1} maxWidth="85%">
          <Text fontWeight="bold">Priorizar fornecedores</Text>
          <CustomSubtitle>Defina com quem você deseja comprar</CustomSubtitle>
        </YStack>
        <Switch
          size="$3"
          checked={combinacao.preferencia_fornecedor_tipo === 'especifico'}
          onCheckedChange={handleFornecedorTipo}
          backgroundColor={
            combinacao.preferencia_fornecedor_tipo === 'especifico' ? '$green10' : '#7c7c7dff'
          }
          padding={0}
        >
          <Switch.Thumb backgroundColor="white" animation="quick" scale={0.9} />
        </Switch>
      </XStack>

      {combinacao.preferencia_fornecedor_tipo === 'especifico' && (
        <ContainerSelecaoItems
          label="Considerar SOMENTE os fornecedores"
          items={selectFornecedoresContexto}
          value={
            Array.isArray(combinacao?.fornecedores_especificos)
              ? combinacao.fornecedores_especificos
              : []
          }
          onChange={onChange}
          onRemove={(item) => {
            const fornecedoresAtuais = combinacao.fornecedores_especificos ?? [];
            if (fornecedoresAtuais.length === 1) {
              setIgnorarValidacao(true);
              setTipoTemporario(combinacao.preferencia_fornecedor_tipo ?? null);
              setShowModal(true);
            } else {
              // Remove normalmente
              const updated = fornecedoresAtuais.filter((v) => v !== item);
              updateCampo('fornecedores_especificos', updated);
            }
          }}
          schemaPath="fornecedores_especificos"
          extraValidationContext={{
            preferencia_fornecedor_tipo: combinacao.preferencia_fornecedor_tipo,
          }}
          zIndex={2000}
          error={error}
          ignoreValidation={ignorarValidacao}
        />
      )}
    </YStack>
  );
}
