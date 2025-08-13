import {
  AvailableSupplier,
  ChosenSupplierQuote,
  FinalProductItem,
  OutputSupplier,
} from "@/src/types/suppliersDataTypes";
import { generateAbbreviation } from "./generateAbbreviation";

export function mergeSupplierData(
  chosenSuppliers: ChosenSupplierQuote[],
  allSuppliers: AvailableSupplier[]
): OutputSupplier[] {
  const finalResult: OutputSupplier[] = [];

  for (const selectedCombination of chosenSuppliers) {

    for (const chosenSupplier of selectedCombination.resultadoCotacao.supplier) {
      
      const chosenSupplierId = chosenSupplier.id;

      const matchingSupplier = allSuppliers.find(
        (s) => s.supplier.externalId === chosenSupplierId
      );

      if (matchingSupplier) {
        const finalProducts: FinalProductItem[] = [];

        for (const chosenProduct of chosenSupplier.cart) {
          const matchingProduct = matchingSupplier.supplier.discount.product.find(
            (p) => p.sku === chosenProduct.productId
          );

          if (matchingProduct) {
            const newProduct: FinalProductItem = {
              price: chosenProduct.value,
              priceWithoutTax: chosenProduct.valueWithoutFee,
              name: matchingProduct.name,
              sku: matchingProduct.sku,
              quant: chosenProduct.amount,
              orderQuant: chosenProduct.amount,
              obs: matchingProduct.obs,
              priceUnique: chosenProduct.unitValueWithoutFee,
              priceUniqueWithTaxAndDiscount: chosenProduct.unitValue,
              image: matchingProduct.image,
              orderUnit: matchingProduct.orderUnit,
            };
            finalProducts.push(newProduct);
          }
        }

        const abbreviation = generateAbbreviation(matchingSupplier.supplier.name);
        const finalSupplier: OutputSupplier = {
          supplier: {
            name: matchingSupplier.supplier.name,
            externalId: matchingSupplier.supplier.externalId,
            image: `https://placehold.co/80x80/22C55E/FFFFFF?text=${abbreviation}`,
            missingItens: matchingSupplier.supplier.missingItens,
            minimumOrder: matchingSupplier.supplier.minimumOrder,
            hour: matchingSupplier.supplier.hour,
            star: matchingSupplier.supplier.star,
            discount: {
              orderValue: chosenSupplier.orderValue,
              discount: chosenSupplier.discountUsed,
              orderWithoutTax: chosenSupplier.orderValueWithoutFee,
              orderWithTax: 0,
              tax: 0,
              missingItens: matchingSupplier.supplier.missingItens,
              orderValueFinish: chosenSupplier.orderValue,
              product: finalProducts,
              sku: "",
            },
          },
        };

        finalResult.push(finalSupplier);
      }
    }
  }

  return finalResult;
}