import { styled, View } from "tamagui"

export const ProductCardStyled = styled(View, {
	width: '92%',
	paddingHorizontal: 8,
	flex: 1,
	justifyContent: 'space-between',
	flexDirection: 'row',
	alignSelf: 'center',
	borderRadius: 12,

	$gtSm: {
		width: '50%'
	},

	"$platform-web": {
		cursor: 'pointer',
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

export const ProductCardBottomStyled = styled(View, {
	width: '92%', 
	minHeight: 85, 
	paddingHorizontal: 8, 
	justifyContent: 'center', 
	alignSelf: 'center', 
	gap: 8, 
	borderTopWidth: 1, 
	borderTopColor: '#ccc',
	borderBottomWidth: 0, 
	borderBottomLeftRadius: 12, 
	borderBottomRightRadius: 12, 
	transform: [{translateY: 0}],

	$gtSm: {
		width: '50%'
	},

	variants: {
		selected: {
			true: {
				backgroundColor: '#a7e9a7ff'
			},
			false: {
				backgroundColor: 'white'
			}
		}
	} as const
})

export const ProductCardObsUnitContainerStyled = styled(View, {
	paddingVertical: 8,
	flex: 1,
	alignItems: 'center',
	flexDirection: 'column-reverse',
	gap: 8,

	$gtMd: {
		flexDirection: 'row'
	}
})