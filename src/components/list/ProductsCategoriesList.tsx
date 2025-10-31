import { FlatList } from "react-native"
import { styled } from "tamagui"

type ProductsCategoriesListProps = {
	dataItems: {name: string}[], 
	renderItemsFunction: ({ item }: any) => JSX.Element,
	keyExtractorFunction: (item: any) => string,
}

export const ProductsCategoriesListStyled = styled(FlatList, {
	width: '100%', 
	minHeight: 50,
	maxHeight: 55, 
	contentContainerStyle: {
		flexGrow: 1, 
		justifyContent: 'space-between'
	},

	$gtSm: {
		width: '50%', 
		minHeight: 50, 
		maxHeight: 50, 
		alignSelf: 'center', 
	}
})

export function ProductsCategoriesList({ dataItems, renderItemsFunction, keyExtractorFunction }: ProductsCategoriesListProps) {
	return(
		<ProductsCategoriesListStyled 
			data={dataItems}
			renderItem={renderItemsFunction}
			keyExtractor={keyExtractorFunction}
			horizontal
			showsHorizontalScrollIndicator={false}
		/>
	)
}

{/* <FlatList
	style={{
		marginTop: -5,
		maxHeight: Platform.OS === 'web' ? 50 : 55,
		minHeight: Platform.OS === 'web' ? 50 : undefined,
		width: Platform.OS === 'web' ? '50%' : undefined,
		alignSelf: Platform.OS === 'web' ? 'center' : undefined,
	}}
	contentContainerStyle={{
		flexGrow: 1,
		justifyContent: 'space-between'
	}}
	data={classItems}
	horizontal
	showsHorizontalScrollIndicator={false}
	keyExtractor={(item: any) => item.name}
	renderItem={renderClassItem}
/> */}