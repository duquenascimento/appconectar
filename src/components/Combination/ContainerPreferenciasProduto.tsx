import Icons from '@expo/vector-icons/Ionicons';
import { YStack, Text, Button, Separator, XStack, Switch } from 'tamagui';
import { useEffect, useState } from 'react';
import { PreferenciaProdutoCard } from './PreferenciaProdutoCard';
import { useCombinacao } from '@/src/contexts/combinacao.context';
import { CustomRadioButton } from '../button/customRadioButton';
import { TwoButtonCustomAlert } from '../modais/TwoButtonCustomAlert';
import { resetarPreferencias } from '../../utils/preferenciaUtils';
import CustomSubtitle from '../subtitle/customSubtitle';

export function ContainerPreferenciasProduto({
  error,
  onClearErrors,
  triggerValidation,
}: {
  error?: string;
  onClearErrors: () => void;
  triggerValidation?: boolean;
}) {
  const { combinacao, updateCampo } = useCombinacao();
  const [showModal, setShowModal] = useState(false);

  const preferencias = combinacao.preferencias ?? [];

  const resetPreferencias = () => {
    const atualizado = resetarPreferencias(combinacao);
    updateCampo('definir_preferencia_produto', atualizado.definir_preferencia_produto);
    updateCampo('preferencias', atualizado.preferencias);
    setShowModal(false);
    onClearErrors();
  };

  useEffect(() => {}, [showModal]);

  const handleDefinirPreferencias = () => {
    if (preferencias.length !== 0) {
      setShowModal(true);
    } else {
      updateCampo('definir_preferencia_produto', false);
      onClearErrors();
    }
  };

  const adicionarPreferencia = () => {
    const novaPreferencia = {
      ordem: preferencias.length + 1,
      tipo: 'fixar' as const,
      produtos: [
        {
          produto_sku: undefined,
          classe: undefined,
          fornecedores: [],
          acao_na_falha: 'ignorar' as const,
        },
      ],
    };

    updateCampo('preferencias', [...preferencias, novaPreferencia]);
  };

  const removerPreferencia = (index: number) => {
    const atualizadas = preferencias
      .filter((_, i) => i !== index)
      .map((p, i) => ({
        ...p,
        ordem: i + 1,
      }));
    updateCampo('preferencias', atualizadas);
  };

  const moverPreferencia = (from: number, to: number) => {
    if (to < 0 || to >= preferencias.length) return;

    const atualizadas = [...preferencias];
    const [item] = atualizadas.splice(from, 1);
    atualizadas.splice(to, 0, item);

    const reordenadas = atualizadas.map((p, i) => ({
      ...p,
      ordem: i + 1,
    }));
    updateCampo('preferencias', reordenadas);
  };

  const handleToggle = (value: boolean) => {
    if (value) {
      updateCampo('definir_preferencia_produto', true);
    } else {
      handleDefinirPreferencias();
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
      <TwoButtonCustomAlert
        visible={showModal}
        title="Tem certeza de que quer realizar esta ação?"
        message="Ao fazer isto, as preferências de produto serão removidas"
        onConfirm={resetPreferencias}
        onCancel={() => setShowModal(false)}
      />

      <XStack justifyContent="space-between" alignItems="center">
        <YStack flexShrink={1} maxWidth="85%">
          <Text fontWeight="bold">Criar preferências de produtos</Text>
          <CustomSubtitle>Defina quem deve entregar determinados produtos</CustomSubtitle>
        </YStack>
        <Switch
          size="$3"
          checked={combinacao.definir_preferencia_produto}
          onCheckedChange={handleToggle}
          backgroundColor={combinacao.definir_preferencia_produto ? '$green10' : '#7c7c7dff'}
          padding={0}
        >
          <Switch.Thumb backgroundColor="white" animation="quick" scale={0.9} />
        </Switch>
      </XStack>

      <Separator />

      {error && (
        <Text p="$1" color="red">
          {error}
        </Text>
      )}

      {combinacao.definir_preferencia_produto &&
        preferencias.map((_, index) => (
          <PreferenciaProdutoCard
            key={index}
            index={index}
            onRemove={() => removerPreferencia(index)}
            onMoveUp={() => moverPreferencia(index, index - 1)}
            onMoveDown={() => moverPreferencia(index, index + 1)}
            triggerValidation={triggerValidation}
          />
        ))}

      {combinacao.definir_preferencia_produto && (
        <Button mt="$2" onPress={adicionarPreferencia} marginVertical="$4">
          <Icons name="add" size={20} />
          Adicionar Produto
        </Button>
      )}
    </YStack>
  );
}
