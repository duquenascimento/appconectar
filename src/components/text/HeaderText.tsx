import { styled, Text } from "tamagui";

type HeaderTextProps = {
	children: string
}

export const HeaderTextStyled = styled(Text, {
	width: '92%',
	marginTop: 15,
	alignSelf: 'center',

	$gtSm: {
		width: '50%'
	}
})

export function HeaderText({ children }: HeaderTextProps) {
	return (
		<>
			<HeaderTextStyled>
				{ children }
			</HeaderTextStyled>
		</>
	)
}