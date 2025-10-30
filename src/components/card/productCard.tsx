import { styled, Text, View } from "tamagui"

type productCardProps = {
	selected: boolean, 
	bottom: boolean,
	children: React.ReactNode
}

export const ProductCardStyled = styled(View, {
	paddingHorizontal: 8,
	minHeight: 40,
	flex: 1,
	justifyContent: 'space-between',
	alignItems: 'center',
	alignSelf: 'center',
	flexDirection: 'row',
	borderRadius: 12,

	"$platform-web": {
		width: '50%',
		cursor: 'pointer',
	},

	"$platform-native": {
		width: '92%'
	},

	variants: {
		selected: {
			true: {
				backgroundColor: '#c4fcc6ff'
			},
			false: {
				backgroundColor: 'white'
			}
		},
		resetBottomBorderRadius: {
			true: {
				borderBottomLeftRadius: 0,
				borderBottomRightRadius: 0
			},
			false: {}
		}
	} as const
})

export default function ProductCard({ children, selected, bottom }: productCardProps) {
	return (
		<View>
			<ProductCardStyled selected={selected} resetBottomBorderRadius={bottom}>
				{ children }
			</ProductCardStyled>
		</View>
	)
}