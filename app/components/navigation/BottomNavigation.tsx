import { clearStorage, deleteToken } from '../../utils/utils';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationTypes';

type BottomNavigationProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>; // Tipagem corrigida
    cartSize: number;
    onCartPress: () => void;
};

export function BottomNavigation({ navigation, cartSize, onCartPress }: BottomNavigationProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.replace('Products')}
            >
                <Icons name="home" size={20} color="#04BF7B" />
                <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate('Orders')}
            >
                <Icons name="journal" size={20} color="gray" />
                <Text style={styles.navText}>Meus Pedidos</Text>
            </TouchableOpacity>

            {/*<TouchableOpacity
                style={styles.navItem}
                onPress={onCartPress}
            >
                <View style={styles.cartIconContainer}>
                    <Icons name="cart" size={20} color="white" />
                    {cartSize > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartSize}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.navText}>Carrinho</Text>
            </TouchableOpacity>*/}

            <TouchableOpacity
                style={styles.navItem}
                onPress={async () => {
                    await onCartPress(); // Salva o carrinho antes de sair
                    await Promise.all([clearStorage(), deleteToken()]);
                    navigation.replace('Sign');
                }}
            >
                <Icons name="log-out" size={20} color="gray" />
                <Text style={styles.navText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
}

// Defina os estilos com StyleSheet
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
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 15,
        height: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        fontSize: 10,
        color: 'white',
    },
});