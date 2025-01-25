import { View, Text } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes'; 
import { ordersDetailsScreenStyles as styles }  from '../styles/styles'

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
        </View>
    );
}

