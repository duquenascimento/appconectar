// services/combosService.ts

export type Combo = {
  id: string
  titulo: string
  descricao: string
  preco: string
  infoExtra?: string
  status: 'minha' | 'com_alteracao' | 'indisponivel'
}

// Por enquanto é um mock:
export const getCombinations = async (): Promise<Combo[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: '1',
      titulo: 'Combinação 1',
      descricao: 'Casa Nova + Hortifeira Vip',
      preco: '408,16',
      status: 'minha'
    },
    {
      id: '2',
      titulo: 'Combinação 2',
      descricao: 'Hortifeira Vip + RL',
      preco: '416,16',
      status: 'minha'
    },
    {
      id: '3',
      titulo: 'Combinação nova',
      descricao: 'Hortifeira Vip + RL',
      preco: '500,16',
      status: 'minha'
    },
    {
      id: '3',
      titulo: 'Menor preço c/ alteração',
      descricao: 'Lorem + Ipsum',
      preco: '318,16',
      infoExtra: 'Entrega 07:00 e 09:00',
      status: 'com_alteracao'
    },
    {
      id: '4',
      titulo: 'Menor preço total',
      descricao: 'Lorem + Ipsum',
      preco: '300,16',
      infoExtra: 'Forn. fechado (18h)',
      status: 'indisponivel'
    }
  ]
}
