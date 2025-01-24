// src/screens/OrderDetailsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes'; // Importe o tipo de navegação

// Defina o tipo para a prop 'route'
type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderDetailsScreenProps {
    route: OrderDetailsScreenRouteProp;
}

export function OrderDetailsScreen({ route }: OrderDetailsScreenProps) {
    const { orderId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalhes do Pedido</Text>
            <Text style={styles.detailText}>ID do Pedido: {orderId}</Text>
            {/* Adicione mais detalhes do pedido aqui */}
        </View>
    );
}

// Defina os estilos com StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F0F2F6',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 8,
    },
});