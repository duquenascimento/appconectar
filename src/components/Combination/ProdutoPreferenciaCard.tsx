// import { useEffect, useMemo } from 'react';
// import { YStack } from 'tamagui';
// import { DropdownCampo } from './DropdownCampo';
// import { useCombinacao } from '@/src/contexts/combinacao.context';
// import { Product, Classe } from '@/src/contexts/produtos.context';
// import { useSupplier } from '@/src/contexts/fornecedores.context';
// import { ContainerSelecaoItemsComFornecedor } from './containerSelecaoItemsComFornecedor';

// const acaoNaFalhaItems = [
//   { label: 'Ignorar e pular', value: 'ignorar' },
//   { label: 'Indisponível', value: 'indisponivel' },
// ];

// type Props = {
//   preferenciaIndex: number;
//   produtoIndex: number;
//   produto: {
//     produto_sku?: string;
//     classe?: string;
//     fornecedores: string[];
//     acao_na_falha: 'ignorar' | 'indisponivel';
//   };
//   onMoveUp: () => void;
//   onMoveDown: () => void;
//   onRemove: () => void;
// };

// export function ProdutoPreferenciaCard({ preferenciaIndex, produtoIndex, produto }: Props) {
//   const { combinacao, updateCampo } = useCombinacao();
//   const { suppliers, unavailableSupplier } = useSupplier();

//   const fornecedoresContexto = useMemo(() => {
//     const todosFornecedores = [...suppliers, ...unavailableSupplier];

//     const bloqueados = combinacao.fornecedores_bloqueados || [];

//     const fornecedoresFiltrados = todosFornecedores.filter(
//       (f) => !bloqueados.includes(f.supplier.externalId),
//     );

//     const fornecedoresSelecionados = combinacao.fornecedores_especificos || [];

//     if (combinacao.preferencia_fornecedor_tipo === 'qualquer') {
//       return fornecedoresFiltrados
//         .sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))
//         .map((f) => ({
//           label: f.supplier.name,
//           value: f.supplier.externalId,
//         }));
//     }

//     return fornecedoresFiltrados
//       .filter((f) => fornecedoresSelecionados.includes(f.supplier.externalId))
//       .sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))
//       .map((f) => ({
//         label: f.supplier.name,
//         value: f.supplier.externalId,
//       }));
//   }, [
//     combinacao.preferencia_fornecedor_tipo,
//     combinacao.fornecedores_especificos,
//     combinacao.fornecedores_bloqueados,
//     suppliers,
//     unavailableSupplier,
//   ]);

//   useEffect(() => {
//     if (!busca.trim()) {
//       setSugestoes([]);
//       return;
//     }

//     const termo = busca.toLowerCase();
//     const matchesProduto = productsContext.filter((produto) => {
//       return produto.name.toLowerCase().includes(termo);
//     });
//     const matchesClasse = classe.filter((classe) => {
//       return classe.nome.toLowerCase().includes(termo);
//     });

//     const sugestoesCombinadas = [...matchesProduto, ...matchesClasse].slice(0, 5);

//     setSugestoes(sugestoesCombinadas);
//   }, [busca, productsContext, classe]);

//   function selecionarProduto(itemSelecionado: Product | Classe) {
//     if ('nome' in itemSelecionado) {
//       updateProduto('classe', itemSelecionado.nome ?? undefined);
//     } else {
//       updateProduto('produto_sku', itemSelecionado.sku ?? undefined);
//     }

//     setBusca('');
//     setSugestoes([]);
//   }

//   const updateProduto = (field: keyof typeof produto, value: any) => {
//     const preferencias = [...(combinacao.preferencias ?? [])];
//     const produtos = [...(preferencias[preferenciaIndex].produtos ?? [])];

//     produtos[produtoIndex] = {
//       ...produtos[produtoIndex],
//       [field]: value ?? undefined,
//     };

//     preferencias[preferenciaIndex].produtos = produtos;
//     updateCampo('preferencias', preferencias);
//   };

//   const limparBuscaMutua = (tipo: 'name' | 'classe', valor: string) => {
//     if (tipo === 'name') {
//       updateProduto('produto_sku', valor);
//       updateProduto('classe', undefined);
//     } else {
//       updateProduto('classe', valor);
//       updateProduto('produto_sku', undefined);
//     }
//   };

//   return (
//     <YStack gap="$3" borderWidth={1} borderColor="$gray5" borderRadius="$4" p="$3">
//       <ContainerSelecaoItemsComFornecedor
//         label="Com fornecedor(es)"
//         items={fornecedoresContexto}
//         value={produto.fornecedores ?? []}
//         onChange={(val) => updateProduto('fornecedores', val)}
//         schemaPath={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].fornecedores`}
//         zIndex={30000}
//       />

//       <DropdownCampo
//         campo={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].acao_na_falha`}
//         schemaPath={`preferencias[${preferenciaIndex}].produtos[${produtoIndex}].acao_na_falha`}
//         label="Não sendo possível..."
//         items={acaoNaFalhaItems}
//         value={produto.acao_na_falha}
//         onChange={(val) => updateProduto('acao_na_falha', val)}
//         zIndex={2500}
//       />
//     </YStack>
//   );
// }
