import { YStack, XStack, Input, Button, Text } from 'tamagui'
import { DropdownCampo } from './DropdownCampo'
import { ContainerSelecaoItems } from './ContainerSelecaoItems'
import Icons from '@expo/vector-icons/Ionicons'
import { useEffect, useMemo, useState } from 'react'
import { useCombinacao } from '@/src/contexts/combinacao.context'
import { Product, Classe, useProductContext } from '@/src/contexts/produtos.context'
import { useSupplier } from '@/src/contexts/fornecedores.context'

const acaoNaFalhaItems = [
  { label: "Ignorar e pular", value: "ignorar" },
  { label: "Indisponível", value: "indisponivel" },
];

type Props = {
  preferenciaIndex: number;
  produtoIndex: number;
  produto: {
    produto_name?: string;
    classe?: string;
    fornecedores: string[];
    acao_na_falha: "ignorar" | "indisponivel";
  };
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function ProdutoPreferenciaCard({ preferenciaIndex, produtoIndex, produto, onMoveUp, onMoveDown, onRemove }: Props) {
  const { combinacao, updateCampo } = useCombinacao()
  const { productsContext, classe } = useProductContext()
  const [busca, setBusca] = useState('')
  const [sugestoes, setSugestoes] = useState<(Product | Classe)[]>([])
  const [selecionados, setSelecionados] = useState<Product[]>([])

  const { suppliers, unavailableSupplier } = useSupplier();
  
  const fornecedoresContexto = useMemo(() => {
    const todosFornecedores = [...suppliers, ...unavailableSupplier];
    const fornecedoresSelecionados = combinacao.fornecedores_especificos || [];

    return todosFornecedores
      .filter(f => fornecedoresSelecionados.includes(f.supplier.externalId))
      .sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))
      .map(f => ({
        label: f.supplier.name,
        value: f.supplier.externalId
      }));
  }, [combinacao.fornecedores_especificos, suppliers, unavailableSupplier]);

  useEffect(() => {
    if (!busca.trim()) {
      setSugestoes([])
      return
    }

    const termo = busca.toLowerCase()
    const matchesProduto = productsContext.filter((produto) => {
      return produto.name.toLowerCase().includes(termo)
    })
    const matchesClasse = classe.filter((classe) => {
      return classe.nome.toLowerCase().includes(termo)
    })

    const sugestoesCombinadas = [...matchesProduto, ...matchesClasse].slice(0, 5)

    setSugestoes(sugestoesCombinadas)
  }, [busca, productsContext, classe])

  function selecionarProduto(itemSelecionado: Product | Classe) {
    if ('nome' in itemSelecionado) {
      updateProduto('classe', itemSelecionado.nome)
      updateProduto('produto_name', undefined)
    } else {
      updateProduto('produto_name', itemSelecionado.name)
      updateProduto('classe', undefined)
    }

    setBusca('')
    setSugestoes([])
  }

  const updateProduto = (field: keyof typeof produto, value: any) => {
    const preferencias = [...(combinacao.preferencias ?? [])];
    const produtos = [...(preferencias[preferenciaIndex].produtos ?? [])];

    produtos[produtoIndex] = {
      ...produtos[produtoIndex],
      [field]: value,
    };

    preferencias[preferenciaIndex].produtos = produtos;
    updateCampo("preferencias", preferencias);
  };

  const limparBuscaMutua = (tipo: "name" | "classe", valor: string) => {
    if (tipo === "name") {
      updateProduto("produto_name", valor);
      updateProduto("classe", undefined);
    } else {
      updateProduto("classe", valor);
      updateProduto("produto_name", undefined);
    }
  };

  return (
    <YStack
      borderWidth={1}
      borderColor="$gray4"
      borderRadius="$4"
      p="$3"
      gap="$2"
    >
      <Text>Fixar produtos e/ou classes</Text>

      <XStack alignItems="center" gap="$2">
        <Input
          flex={1}
          placeholder="Buscar produto ou classe"
          value={busca}
          onChangeText={setBusca}
        />
        <Button
          onPress={() => {
            if (!busca.trim()) return

            const valor = busca.trim().toLowerCase()

            const matchClasse = classe.find((c) => c.nome.toUpperCase().includes(valor))

            if (matchClasse) {
              limparBuscaMutua('classe', matchClasse.nome)
            } else {
              const matchProduto = productsContext.find((p) => p.name.toLowerCase().includes(valor))

              if (matchProduto) {
                limparBuscaMutua('name', matchProduto.name)
              } else {
                console.warn('Produto ou classe não encontrado:', valor)
              }
            }

            setBusca('')
          }}
        >
          <Icons name="search" size={20} />
        </Button>
      </XStack>

      {busca.length > 0 && sugestoes.length > 0 && (
        <YStack mt="$2" gap="$1">
          {sugestoes.map((item) => {
            const isClasse = 'nome' in item

            return (
              <Text key={item.id} onPress={() => selecionarProduto(item)} paddingVertical="$3" paddingHorizontal="$4" borderBottomWidth={1} borderColor="$gray4" alignItems="center" justifyContent="space-between">
                {isClasse ? item.nome : item.name}
              </Text>
            )
          })}
        </YStack>
      )}

      {selecionados.length > 0 && (
        <YStack mt="$4" gap="$1">
          <Text fontWeight="bold">Produtos selecionados:</Text>
          {selecionados.map((produto) => (
            <Text key={produto.id}>• {produto.name}</Text>
          ))}
        </YStack>
      )}

      {(produto.produto_name || produto.classe) && (
        <XStack flexWrap="wrap" gap="$2">
          {produto.produto_name && (
            <XStack
              px="$2"
              py="$1"
              borderRadius={8}
              backgroundColor="$gray3"
              alignItems="center"
            >
              <Text>{produto.produto_name}</Text>
              <Button
                size="$1"
                circular
                ml="$2"
                backgroundColor="transparent"
                onPress={() => updateProduto("produto_name", undefined)}
              >
                ×
              </Button>
            </XStack>
          )}
          {produto.classe && (
            <XStack
              px="$2"
              py="$1"
              borderRadius={8}
              backgroundColor="$gray3"
              alignItems="center"
            >
              <Text>{produto.classe}</Text>
              <Button
                size="$1"
                circular
                ml="$2"
                backgroundColor="transparent"
                onPress={() => updateProduto("classe", undefined)}
              >
                ×
              </Button>
            </XStack>
          )}
        </XStack>
      )}

      <ContainerSelecaoItems
        label="Com fornecedor(es)"
        items={fornecedoresContexto}
        value={produto.fornecedores}
        onChange={(val) => updateProduto("fornecedores", val)}
        schemaPath={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].fornecedores`}
        zIndex={3000}
      />

      <DropdownCampo
        campo={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].acao_na_falha`}
        schemaPath={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].acao_na_falha`}
        label="Não sendo possível..."
        items={acaoNaFalhaItems}
        value={produto.acao_na_falha}
        onChange={(val) => updateProduto("acao_na_falha", val)}
        zIndex={2500}
      />
    </YStack>
  );
}
