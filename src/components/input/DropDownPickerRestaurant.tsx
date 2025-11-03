import { Restaurant } from "@/app/products";
import { useEffect, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { styled, useMedia } from "tamagui";

type DropDownPickerRestaurantProps = {
	restaurants: Restaurant[],
	currentSelectedRestaurant: string | null, 
	onChangeValueFunction: (value: any | null) => Promise<void>
}

const DropDownPickerRestaurantStyled = styled(DropDownPicker, {
	width: '92%',
	height: 40,
	marginVertical: 8,
	alignSelf: 'center',
	borderColor: '#ccc',
	borderWidth: 1,
	borderRadius: 5,
	listMode: 'SCROLLVIEW',
	dropDownDirection: 'BOTTOM',

	$gtSm: {
		width: '50%',
	}
})

export function DropDownPickerRestaurant({ restaurants, currentSelectedRestaurant, onChangeValueFunction }: DropDownPickerRestaurantProps) {
	const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
	const [restaurantOpen, setRestaurantOpen] = useState(false);

	useEffect(() => {
		setSelectedRestaurant(currentSelectedRestaurant)
	}, [currentSelectedRestaurant])

	const media = useMedia()

	return (
		<DropDownPickerRestaurantStyled
			open={restaurantOpen}
			setOpen={setRestaurantOpen}
			value={selectedRestaurant}
			setValue={setSelectedRestaurant}
			onChangeValue={onChangeValueFunction}
			items={restaurants.map((restaurant) => ({
				label: restaurant.name,
				value: restaurant.externalId,
			}))}
			placeholder={ selectedRestaurant ? undefined : 'Selecione um restaurante' }
			dropDownContainerStyle={{
				width: '92%',
				alignSelf: 'center',

				...(media.gtSm && {
					width: '50%'
				})
			}}
		/>
	)
}