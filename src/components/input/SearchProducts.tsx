import { Input, styled, XStack } from "tamagui";
import Icons from '@expo/vector-icons/Ionicons';

type SearchProductsProps = {
	searchQuery: string, 
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}

export const SearchProductsXStackStyled = styled(XStack, {
	width: '92%', 
	paddingRight: 14,
	marginTop:30,
	borderWidth:0,
	borderRadius: 20,
	backgroundColor: '#F0F2F6',
	alignItems: 'center',
	alignSelf: 'center',
	flexDirection: 'row',

	$gtSm: {
		width: '50%'
	}
})

export const SearchProductsInputStyled = styled(Input, {
	flex: 1,
	backgroundColor: 'transparent', 
	borderColor: 'transparent',
	borderWidth: 0,
	outlineStyle: 'none', 
	focusVisibleStyle: {
		outlineWidth: 0
	},
	maxLength: 50
})

export function SearchProducts({ searchQuery, setSearchQuery }: SearchProductsProps) {
	return (
		<SearchProductsXStackStyled>
			<SearchProductsInputStyled
				placeholder='Buscar produtos...'
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>
			<Icons name='search' size={24} color='#04BF7B' />
		</SearchProductsXStackStyled>
	)
}