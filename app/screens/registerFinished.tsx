import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, Button } from "tamagui";
import Icons from '@expo/vector-icons/Ionicons';

type RootStackParamList = {
    Home: undefined;
    Products: undefined
    Confirm: undefined
    Prices: undefined
    RegisterFinished: undefined
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function RegisterFinished({ navigation }: HomeScreenProps) {
    return (
        <View padding={30} backgroundColor='#F0F2F6' f={1} justifyContent="center" alignItems="center">
            <Icons size={90} color='#04BF7B' name="checkmark-circle"></Icons>
            <Text pb={25} fontSize={30}>Cadastro feito!</Text>
            <View padding={15} borderRadius={5} width='80%'>
                <Button onPress={async () => {
                    navigation.replace('Products')
                }} backgroundColor='#04BF7B'><Icons size={20} color='white' name="checkmark"></Icons></Button>
            </View>
        </View>
    )
}