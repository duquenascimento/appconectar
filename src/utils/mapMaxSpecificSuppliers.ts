import { ComboOption } from "../types/componentTypes"

export function mapMaxSpecificSuppliers(maxSuppliers: number): ComboOption<number>[] {
	const options = [{ label: '2 fornecedores', value: 2 }]

	if (maxSuppliers == 2)
		return options

	for (let i = 3; i <= maxSuppliers; i++) {
		options.push({ label: `${i} fornecedores`, value: i })
	}

	return options
}