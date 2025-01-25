import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icons from '@expo/vector-icons/Ionicons';
import { getOrders } from '../services/orderService';
import { RootStackParamList } from '../types/navigationTypes';
import { ordersScreenStyles } from '../styles/styles';
import { BottomNavigation } from '../components/navigation/BottomNavigation';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

interface Order {
    id: string;
    orderDate: string;
    totalConectar: number;
    calcOrderAgain: {
        data: {
            supplier: {
                name: string;
            };
        }[];
    };
}

export function OrdersScreen({ navigation }: { navigation: OrdersScreenNavigationProp }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const ordersData = await getOrders();
                setOrders(ordersData);
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const renderItem = ({ item }: { item: Order }) => {
        const supplierName = item.calcOrderAgain?.data[0]?.supplier?.name || 'Fornecedor não disponível';

        return (
            <TouchableOpacity
                style={ordersScreenStyles.orderItem}
                onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
            >
                <Text style={ordersScreenStyles.orderId}>{item.id}</Text>

                <Text style={ordersScreenStyles.orderDate}>
                    {new Date(item.orderDate).toLocaleDateString('pt-BR')}
                </Text>

                <Text style={ordersScreenStyles.totalConectar}>
                    R$ {item.totalConectar.toFixed(2)}
                </Text>

                <Text style={ordersScreenStyles.supplierName}>{supplierName}</Text>

                <Icons name="chevron-forward" size={24} color="#04BF7B" />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={ordersScreenStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <>
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
            <View>
                <BottomNavigation navigation={navigation} />
            </View>
        </>
    );
}