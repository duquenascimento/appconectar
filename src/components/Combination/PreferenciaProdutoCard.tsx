import Icons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Separator, Text, XStack, YStack } from 'tamagui';
import { useCombinacao } from '@/src/contexts/combinacao.context';
import { useSupplier } from '@/src/contexts/fornecedores.context';
import { Classe, useProductContext } from '@/src/contexts/produtos.context';
import { preferenciaProdutoSchema } from '@/src/validators/combination.form.validator';
import { AcaoNaFalha, ProdutoPreferencia } from '../../types/combinationTypes';
import { SupplierData } from '../../types/types';
import { updatePreferencia } from '../../utils/preferenciaUtils';
import { ContainerSelecaoItemsComFornecedor } from './containerSelecaoItemsComFornecedor';
import { DropdownCampo } from './DropdownCampo';

type Props = {
  index: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  triggerValidation?: boolean;
};

const tipoProdutoItems = [
  { label: 'Fixar produtos por fornecedor', value: 'fixar' },
  { label: 'Remover produtos por fornecedor', value: 'remover' },
];

export function PreferenciaProdutoCard({
  index,
  onMoveUp,
  onMoveDown,
  onRemove,
  triggerValidation,
}: Props) {
  const { combinacao, updateCampo } = useCombinacao();
  const { productsContext, classe } = useProductContext();
  const { suppliers, unavailableSupplier, loadRestaurants } = useSupplier();
  const bloqueados = combinacao.fornecedores_bloqueados || [];

  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [produtosValidationError, setProdutosValidationError] = useState<string>('');
  const [fornecedoresValidationError, setFornecedoresValidationError] = useState<string>('');
  const [produtosTouched, setProdutosTouched] = useState(false);
  const [fornecedoresTouched, setFornecedoresTouched] = useState(false);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Classe[]>([]);

  useEffect(() => {
    async function getRestaurants() {
      const restaurants = await loadRestaurants();

      const verduraKg = restaurants.filter((rest: any) => rest.verduraKg === true);

      if (verduraKg.length) {
        setAvailableProducts(
          productsContext.filter((item) => {
            return !(item.class.trim() === 'VERDURAS');
          }),
        );
        setAvailableClasses(
          classe.filter((c) => {
            return !(c.nome.trim() === 'VERDURAS');
          }),
        );
      } else {
        setAvailableProducts(
          productsContext.filter((item) => {
            return !(item.class.trim() == 'VERDURAS - KG');
          }),
        );
        setAvailableClasses(
          classe.filter((c) => {
            return !(c.nome.trim() == 'VERDURAS - KG');
          }),
        );
      }
    }
    getRestaurants();
  }, [productsContext]);

  const preferencia = combinacao.preferencias?.[index];
  if (!preferencia) return null;

  const productsRaw = preferencia.produtos.filter((item) => item.produto_sku || item.classe);
  const produtos = Array.from(
    new Map(
      productsRaw.map((item) => {
        const key = item.produto_sku ? `produto_sku:${item.produto_sku}` : `classe:${item.classe}`;

        return [key, item];
      }),
    ).values(),
  );

  const validateProducts = async () => {
    try {
      const validProducts = preferencia.produtos.filter((p) => p.produto_sku || p.classe);
      await preferenciaProdutoSchema.validateAt('produtos', { produtos: validProducts });
      setProdutosValidationError('');
      setProdutosTouched(true);
    } catch (err: any) {
      setProdutosValidationError(err.message || 'Erro de validação');
    }
  };

  const validateFornecedores = async () => {
    try {
      const validFornecedores = preferencia.produtos[index]?.fornecedores ?? [];
      await preferenciaProdutoSchema.validateAt('fornecedores', {
        fornecedores: validFornecedores,
      });
      setFornecedoresValidationError('');
      setFornecedoresTouched(true);
    } catch (err: any) {
      setFornecedoresValidationError(err.message || 'Erro de validação');
    }
  };

  const atualizarCampoLocal = (key: keyof typeof preferencia, value: any) => {
    const novaCombinacao = updatePreferencia(combinacao, index, {
      ...preferencia,
      [key]: value,
    });
    updateCampo('preferencias', novaCombinacao.preferencias);
  };

  const atualizarFornecedoresPreferencia = (fornecedores: string[]) => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])];
    novasPreferencias[index].fornecedores = fornecedores;
    novasPreferencias[index].produtos = novasPreferencias[index].produtos.map((p) => ({
      ...p,
      fornecedores,
    }));
    updateCampo('preferencias', novasPreferencias);
    setFornecedoresTouched(true);
    setTimeout(() => validateFornecedores(), 0);
  };

  const atualizarAcaoNaFalhaPreferencia = (acao_na_falha: string) => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])];
    const produtosAtualizados = novasPreferencias[index].produtos
      .filter((p) => !(p.produto_sku && p.classe))
      .map((produto) => ({
        ...produto,
        acao_na_falha: acao_na_falha as AcaoNaFalha,
      }));

    novasPreferencias[index].produtos = produtosAtualizados;
    updateCampo('preferencias', novasPreferencias);
  };

  const fornecedoresComuns = useMemo(() => {
    if (preferencia.produtos.length === 0) return [];
    const fornecedoresUnicos = Array.from(
      new Set(
        preferencia.produtos
          .flatMap((p) => p.fornecedores)
          .filter((f) => f !== undefined && f !== null),
      ),
    );

    return fornecedoresUnicos;
  }, [preferencia.produtos]);

  const acaoNaFalhaComum = useMemo(() => {
    if (preferencia.produtos.length === 0) return 'ignorar';

    const primeiraAcao = preferencia.produtos[0]?.acao_na_falha || 'ignorar';
    const todosIguais = preferencia.produtos.every((p) => p.acao_na_falha === primeiraAcao);

    return todosIguais ? primeiraAcao : 'ignorar';
  }, [preferencia.produtos]);

  const adicionarProduto = (itemSelecionado: any) => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])];
    const produtos = [...(novasPreferencias[index].produtos ?? [])];

    const novoProduto = {
      produto_sku: itemSelecionado.sku ?? undefined,
      classe: itemSelecionado.nome ?? undefined,
      acao_na_falha: AcaoNaFalha.IGNORAR,
      fornecedores: fornecedoresComuns,
    };

    const jaExiste = produtos.some(
      (p) => p.produto_sku === novoProduto.produto_sku && p.classe === novoProduto.classe,
    );

    if (!jaExiste) {
      produtos.push(novoProduto);
      novasPreferencias[index].produtos = produtos;
      updateCampo('preferencias', novasPreferencias);
      setProdutosTouched(true);
      validateProducts();
    }

    setBusca('');
    setSugestoes([]);
  };

  const removerProduto = (produto: ProdutoPreferencia) => {
    const novasPreferencias = [...(combinacao.preferencias ?? [])];
    novasPreferencias[index].produtos = novasPreferencias[index].produtos.filter(
      (p) => !(p.produto_sku === produto.produto_sku && p.classe === produto.classe),
    );
    updateCampo('preferencias', novasPreferencias);
    setProdutosTouched(true);
    // Validate after state update
    setTimeout(() => validateProducts(), 0);
  };

  const fornecedoresDisponiveis = useMemo(() => {
    const todosFornecedores: SupplierData[] = [
      ...(suppliers ?? []),
      ...(unavailableSupplier ?? []),
    ];

    const fornecedoresLocal = todosFornecedores
      .map((f) => ({
        id: f.supplier?.externalId ?? null,
        nome: f.supplier?.name ?? '',
      }))
      .filter((f) => f.id && !bloqueados.includes(f.id))
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((f) => ({
        label: f.nome,
        value: f.id!,
      }));

    return fornecedoresLocal;
  }, [suppliers, unavailableSupplier, combinacao.fornecedores_bloqueados]);

  useEffect(() => {
    if (!busca.trim()) {
      setSugestoes([]);
      return;
    }

    const termo = busca.toLowerCase();

    const matchesProduto = availableProducts.filter((produto) =>
      produto.name.toLowerCase().includes(termo),
    );
    const matchesClasse = availableClasses.filter((c) => c.nome.toLowerCase().includes(termo));

    const sugestoesLocal = [...matchesProduto, ...matchesClasse].slice(0, 5);

    setSugestoes(sugestoesLocal);
  }, [busca, availableProducts, availableClasses]);

  useEffect(() => {
    validateProducts();
  }, [preferencia.produtos]);

  useEffect(() => {
    validateProducts();
  }, [preferencia.fornecedores]);

  useEffect(() => {
    if (triggerValidation) {
      setProdutosTouched(true);
      setFornecedoresTouched(true);
      validateProducts();
      validateFornecedores();
    }
  }, [triggerValidation]);

  return (
    <YStack borderWidth={1} borderColor="$gray6" borderRadius="$4" padding="$4" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold">Prioridade {index + 1}</Text>
        <XStack gap="$2">
          <Button onPress={onMoveUp} size="$2">
            <Icons name="chevron-up" size={20} />
          </Button>
          <Button onPress={onMoveDown} size="$2">
            <Icons name="chevron-down" size={20} />
          </Button>
          <Button onPress={onRemove} size="$2">
            <Icons name="trash" size={20} />
          </Button>
        </XStack>
      </XStack>

      <Separator />

      <DropdownCampo
        campo={`preferencias[${index}].tipo`}
        label="Eu quero..."
        items={tipoProdutoItems}
        value={preferencia.tipo}
        onChange={(val) => atualizarCampoLocal('tipo', val)}
        schemaPath={`preferencias[${index}].tipo`}
        zIndex={3000}
      />

      <Text fontWeight="bold" marginTop="$3">
        Fixar produtos e/ou classes
      </Text>

      <XStack alignItems="center" gap="$2">
        <Input
          flex={1}
          placeholder="Buscar produto ou classe"
          value={busca}
          onChangeText={setBusca}
        />
        <Button
          onPress={() => {
            if (!busca.trim()) return;

            const termo = busca.toLowerCase();
            const matchClasse = availableClasses.find((c) => c.nome.toLowerCase().includes(termo));
            const matchProduto = availableProducts.find((p) =>
              p.name.toLowerCase().includes(termo),
            );

            if (matchClasse) adicionarProduto(matchClasse);
            else if (matchProduto) adicionarProduto(matchProduto);

            setBusca('');
          }}
        >
          <Icons name="search" size={20} />
        </Button>
      </XStack>

      {busca.length > 0 && sugestoes.length > 0 && (
        <YStack marginTop="$2" gap="$1">
          {sugestoes.map((item) => (
            <Text
              key={item.id}
              onPress={() => adicionarProduto(item)}
              paddingVertical="$3"
              paddingHorizontal="$4"
              borderBottomWidth={1}
              borderColor="$gray4"
            >
              {'nome' in item ? item.nome : item.name}
            </Text>
          ))}
        </YStack>
      )}

      {preferencia.produtos.length > 0 && (
        <XStack flexWrap="wrap" gap="$2" marginTop="$2">
          {produtos
            .map((p, i) => {
              if (!p.produto_sku && !p.classe) return null;

              const label = p.classe
                ? `Classe: ${p.classe}`
                : `Produto: ${availableProducts.find((prod) => prod.sku === p.produto_sku)?.name}`;

              return (
                <XStack
                  key={i}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius={8}
                  backgroundColor="$gray3"
                  alignItems="center"
                >
                  <Text>{label}</Text>
                  <Button
                    size="$1"
                    circular
                    marginLeft="$2"
                    backgroundColor="transparent"
                    onPress={() => removerProduto(p)}
                  >
                    ×
                  </Button>
                </XStack>
              );
            })
            .filter(Boolean)}
        </XStack>
      )}

      {produtosTouched && produtosValidationError && (
        <Text padding="$1" color="red">
          {produtosValidationError}
        </Text>
      )}

      <ContainerSelecaoItemsComFornecedor
        label="Com fornecedor(es)"
        items={fornecedoresDisponiveis}
        value={fornecedoresComuns}
        onChange={atualizarFornecedoresPreferencia}
        schemaPath={`preferencias[${index}].fornecedores`}
        zIndex={30000}
      />

      {fornecedoresTouched && fornecedoresValidationError && (
        <Text padding="$1" color="red" marginTop="$-2">
          {fornecedoresValidationError}
        </Text>
      )}

      <DropdownCampo
        campo={`preferencias[${index}].acao_na_falha`}
        schemaPath={`preferencias[${index}].acao_na_falha`}
        label="Não sendo possível..."
        items={[
          { label: 'Ignorar e pular', value: 'ignorar' },
          { label: 'Indisponível', value: 'indisponivel' },
        ]}
        value={acaoNaFalhaComum}
        onChange={atualizarAcaoNaFalhaPreferencia}
        zIndex={2500}
      />
    </YStack>
  );
}
