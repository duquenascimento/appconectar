import { RootStackParamList } from '../../types/navigationTypes';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type BottomNavigationProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
};

export function BottomNavigation({ navigation }: BottomNavigationProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => {
                    console.log('Navegando para Products');
                    navigation.navigate('Products');
                }}
            >
                <Icons name="home" size={20} color="#04BF7B" />
                <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => {
                    console.log('Navegando para Orders');
                    navigation.navigate('Orders');
                }}
            >
                <Icons name="journal" size={20} color="gray" />
                <Text style={styles.navText}>Meus Pedidos</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => {
                    console.log('Navegando para Sign');
                    navigation.replace('Sign');
                }}
            >
                <Icons name="log-out" size={20} color="gray" />
                <Text style={styles.navText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 55,
        borderTopWidth: 0.2,
        borderTopColor: 'lightgray',
        backgroundColor: 'white',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    navText: {
        fontSize: 12,
        color: '#04BF7B',
    },
});