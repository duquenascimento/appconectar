export type Product = {
    name: string
    orderUnit: string
    quotationUnit: string
    convertedWeight: number
    class: string
    sku: string
    id: string
    active: boolean
    createdBy: string
    createdAt: string
    changedBy: string
    updatedAt: string
    image: string[]
    favorite?: boolean
    mediumWeight: number
    firstUnit: number
    secondUnit: number
    thirdUnit: number
    obs: string
}

export type ProductClass = {
    id: string
    nome: string
    ativo: boolean
}