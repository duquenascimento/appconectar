import { useCombinacao } from '@/src/contexts/combinacao.context';
import { ComboOption } from '@/src/types/componentTypes';
import { CombinationSupplier } from '@/src/types/suppliersDataTypes';
import { getSupplierLabel } from '@/src/utils/supplierUtils';
import { useEffect, useMemo, useState } from 'react';
import { Separator, Switch, Text, XStack, YStack } from 'tamagui';
import { TipoFornecedor } from '../../types/combinationTypes';
import CustomAlert from '../modais/CustomAlert';
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert';
import CustomSubtitle from '../subtitle/customSubtitle';
import { ContainerSelecaoItems } from './ContainerSelecaoItems';

export function PreferenciaFornecedorCampo({
  suppliers,
  error,
  onChange,
  loadingSuppliers,
}: {
  suppliers: CombinationSupplier[];
  error?: string;
  onChange: (val: string[]) => void;
  loadingSuppliers: boolean;
}) {
  const { combinacao, updateCampo } = useCombinacao();
  const [showModal, setShowModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [tipoTemporario, setTipoTemporario] = useState<TipoFornecedor | null>(null);
  const [ignorarValidacao, setIgnorarValidacao] = useState(false);
  const [selectFornecedoresContexto, setSelectFornecedoresContexto] = useState<
    ComboOption<string>[]
  >([]);

  const fornecedoresContexto = useMemo(() => {
    const todosFornecedores = [...suppliers];

    const fornecedoresNaoBloqueados = todosFornecedores.filter(
      (supplier) => !combinacao.fornecedores_bloqueados?.includes(supplier.idexterno),
    );

    return fornecedoresNaoBloqueados.map((supplier) => ({
      label: getSupplierLabel(supplier),
      value: supplier.idexterno,
    }));
  }, [suppliers, combinacao.fornecedores_bloqueados]);

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
  }, [combinacao, suppliers]);

  const resetarPreferenciaFornecedor = () => {
    if (!tipoTemporario) return;

    updateCampo('preferencia_fornecedor_tipo', tipoTemporario);
    updateCampo('definir_preferencia_produto', true);
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
    const haFornecedoresSelecionados = (combinacao.fornecedores_especificos?.length ?? 0) > 0;

    if (vaiDeixarDeSerEspecifico && haFornecedoresSelecionados) {
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
        title="Tem certeza de que quer realizar esta ação?"
        message="Ao desativar, os fornecedores específicos selecionados serão removidos. As preferências de produtos serão mantidas."
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
          loading={loadingSuppliers}
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
