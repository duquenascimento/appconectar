import { useCombinacao } from '@/src/contexts/combinacao.context';
import { useCombinationSuppliers } from '@/src/contexts/combination-suppliers.context';
import { ComboOption } from '@/src/types/componentTypes';
import { getCombinationSupplierDTOLabel } from '@/src/utils/supplierUtils';
import { useEffect, useMemo, useState } from 'react';
import { Separator, Switch, Text, XStack, YStack } from 'tamagui';
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert';
import CustomSubtitle from '../subtitle/customSubtitle';
import { ContainerSelecaoItems } from './ContainerSelecaoItems';

export function BloqueioFornecedoresCampo({
  error,
  onChange,
}: {
  error?: string;
  onChange: (val: string[]) => void;
}) {
  const { combinacao, updateCampo } = useCombinacao();
  const { suppliers, loading: loadingSuppliers } = useCombinationSuppliers();
  const [showModal, setShowModal] = useState(false);

  const [selectFornecedoresContextoBloq, setSelectFornecedoresContextoBloq] = useState<
    ComboOption<string>[]
  >([]);

  const fornecedoresContexto = useMemo(() => {
    const fornecedoresNaoSelecionados = suppliers
      .filter((s) => s.isAvailable)
      .filter((supplier) => !combinacao.fornecedores_especificos?.includes(supplier.externalId));

    return fornecedoresNaoSelecionados.map((supplier) => ({
      label: getCombinationSupplierDTOLabel(supplier),
      value: supplier.externalId,
    }));
  }, [suppliers, combinacao.fornecedores_especificos]);

  const todosFornecedores = useMemo(
    () =>
      suppliers.map((supplier) => ({
        label: getCombinationSupplierDTOLabel(supplier),
        value: supplier.externalId,
      })),
    [suppliers],
  );

  const unavailableSupplierIds = useMemo(
    () =>
      suppliers.filter((supplier) => !supplier.isAvailable).map((supplier) => supplier.externalId),
    [suppliers],
  );

  const resetFornecedoresBloqueados = () => {
    updateCampo('bloquear_fornecedores', false);
    updateCampo('fornecedores_bloqueados', []);
    setShowModal(false);
  };

  const removerFornecedoresDasPreferencias = (fornecedoresParaRemover: string[]) => {
    if (fornecedoresParaRemover.length === 0) return;

    const fornecedoresParaRemoverSet = new Set(fornecedoresParaRemover);
    const preferenciasAtuais = combinacao.preferencias ?? [];
    let houveAlteracao = false;

    const preferenciasAtualizadas = preferenciasAtuais.map((preferencia) => {
      const fornecedoresPreferenciaAtualizados = (preferencia.fornecedores ?? []).filter(
        (fornecedor) => !fornecedoresParaRemoverSet.has(fornecedor),
      );

      if (fornecedoresPreferenciaAtualizados.length !== (preferencia.fornecedores ?? []).length) {
        houveAlteracao = true;
      }

      const produtosAtualizados = (preferencia.produtos ?? []).map((produto) => {
        const fornecedoresProdutoAtualizados = (produto.fornecedores ?? []).filter(
          (fornecedor) => !fornecedoresParaRemoverSet.has(fornecedor),
        );

        const fornecedorIds = Array.isArray(produto.fornecedor_id)
          ? produto.fornecedor_id
          : produto.fornecedor_id
            ? [produto.fornecedor_id]
            : [];

        const fornecedorIdsAtualizados = fornecedorIds.filter(
          (fornecedor) => !fornecedoresParaRemoverSet.has(fornecedor),
        );

        if (
          fornecedoresProdutoAtualizados.length !== (produto.fornecedores ?? []).length ||
          fornecedorIdsAtualizados.length !== fornecedorIds.length
        ) {
          houveAlteracao = true;
        }

        return {
          ...produto,
          fornecedores: fornecedoresProdutoAtualizados,
          fornecedor_id: fornecedorIdsAtualizados,
        };
      });

      return {
        ...preferencia,
        fornecedores: fornecedoresPreferenciaAtualizados,
        produtos: produtosAtualizados,
      };
    });

    if (houveAlteracao) {
      updateCampo('preferencias', preferenciasAtualizadas);
    }
  };

  const handleBlockedSuppliersChange = (fornecedoresBloqueados: string[]) => {
    onChange(fornecedoresBloqueados);

    const fornecedoresEspecificos = combinacao.fornecedores_especificos ?? [];
    const fornecedoresEspecificosAtualizados = fornecedoresEspecificos.filter(
      (fornecedor) => !fornecedoresBloqueados.includes(fornecedor),
    );

    if (fornecedoresEspecificosAtualizados.length !== fornecedoresEspecificos.length) {
      updateCampo('fornecedores_especificos', fornecedoresEspecificosAtualizados);
    }

    removerFornecedoresDasPreferencias(fornecedoresBloqueados);
  };

  const updateFornecedorLabel = (value: string) => {
    setSelectFornecedoresContextoBloq((prevState) => {
      return prevState.map((obj) => {
        if (obj.value === value) return { ...obj, label: `${obj.label} 🚫` };
        return obj;
      });
    });
  };

  useEffect(() => {
    const combinacaoArray = Array.isArray(combinacao?.fornecedores_bloqueados)
      ? combinacao.fornecedores_bloqueados
      : [];

    setSelectFornecedoresContextoBloq(fornecedoresContexto);

    if (combinacaoArray.length > 0) {
      fornecedoresContexto.forEach((fornecedorLabel) => {
        combinacaoArray.forEach((combinacaoIndexValue) => {
          if (fornecedorLabel.value == combinacaoIndexValue)
            updateFornecedorLabel(combinacaoIndexValue);
        });
      });
    }
  }, [combinacao, fornecedoresContexto]);

  const handleSwitchChange = (checked: boolean) => {
    if (!checked && (combinacao?.fornecedores_bloqueados || []).length !== 0) {
      setShowModal(true);
    } else {
      updateCampo('bloquear_fornecedores', checked);
    }
  };

  return (
    <YStack
      borderWidth={1}
      borderColor="$gray6"
      padding="$4"
      gap={3}
      borderRadius="$4"
      zIndex={2000}
    >
      <TwoButtonCustomAlert
        visible={showModal}
        title="Tem certeza de que quer realizar esta ação?"
        message="Ao fazer isto, os fornecedores selecionados serão removidos"
        onConfirm={resetFornecedoresBloqueados}
        onCancel={() => setShowModal(false)}
      />

      <XStack justifyContent="space-between" alignItems="center">
        <YStack flexShrink={1} maxWidth="85%">
          <Text fontWeight="bold">Bloquear fornecedores</Text>
          <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
        </YStack>
        <Switch
          size="$3"
          checked={!!combinacao.bloquear_fornecedores}
          onCheckedChange={handleSwitchChange}
          backgroundColor={combinacao.bloquear_fornecedores ? '$green10' : '#7c7c7dff'}
          padding={0}
        >
          <Switch.Thumb backgroundColor="white" animation="quick" scale={0.9} />
        </Switch>
      </XStack>

      {combinacao.bloquear_fornecedores && !loadingSuppliers && (
        <>
          <Separator marginVertical="$3" />
          <ContainerSelecaoItems
            loading={loadingSuppliers}
            label="Fornecedores bloqueados"
            items={selectFornecedoresContextoBloq}
            allItems={todosFornecedores}
            unavailableValues={unavailableSupplierIds}
            value={
              Array.isArray(combinacao?.fornecedores_bloqueados)
                ? combinacao.fornecedores_bloqueados
                : []
            }
            onChange={handleBlockedSuppliersChange}
            schemaPath="fornecedores_bloqueados"
            extraValidationContext={{
              bloquear_fornecedores: combinacao.bloquear_fornecedores,
            }}
            zIndex={4000}
            error={error}
          />
        </>
      )}
    </YStack>
  );
}
