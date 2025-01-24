// src/screens/OrdersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icons from '@expo/vector-icons/Ionicons';
import { getStorage } from '../utils/utils';
import { RootStackParamList } from '../types/navigationTypes'; // Importe o tipo
import { ordersScreenStyles } from '../styles/styles'; // Importe os estilos

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

interface Order {
    id: string;
    orderDate: string;
    deliveryDate: string;
    orderHour: string;
    initialDeliveryTime: string;
}

export function OrdersScreen({ navigation }: { navigation: OrdersScreenNavigationProp }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const ordersData = await getStorage('orders');
                if (ordersData) {
                    const parsedOrders = JSON.parse(ordersData);
                    setOrders(parsedOrders.orders);
                }
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={ordersScreenStyles.orderItem}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        >
            <View style={ordersScreenStyles.orderInfo}>
                <Text style={ordersScreenStyles.orderText}>Data do Pedido: {new Date(item.orderDate).toLocaleDateString()}</Text>
                <Text style={ordersScreenStyles.orderText}>Data de Entrega: {new Date(item.deliveryDate).toLocaleDateString()}</Text>
                <Text style={ordersScreenStyles.orderText}>Hora do Pedido: {new Date(item.orderHour).toLocaleTimeString()}</Text>
                <Text style={ordersScreenStyles.orderText}>Hora Inicial de Entrega: {new Date(item.initialDeliveryTime).toLocaleTimeString()}</Text>
            </View>
            <Icons name="chevron-forward" size={24} color="#04BF7B" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={ordersScreenStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <View style={ordersScreenStyles.container}>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={ordersScreenStyles.emptyContainer}>
                        <Text style={ordersScreenStyles.emptyText}>Nenhum pedido encontrado.</Text>
                    </View>
                }
            />
        </View>
    );
}