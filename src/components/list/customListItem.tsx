import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icons from '@expo/vector-icons/Ionicons'
import { Text, View } from 'tamagui'
import { formatCurrency } from '@/app/utils/formatCurrency'

export interface Combination {
    id: string
    combination: string
    supplier?: string
    createdAt?: string
    delivery?: string
    missingItems?: number
    totalValue?: number
}

interface ListItemProps extends Combination {
    onPress: (id: string) => void
}

const CustomListItem: React.FC<ListItemProps> = ({
    id,
    combination,
    supplier,
    createdAt,
    delivery,
    totalValue,
    missingItems,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(id)}>
            <View style={styles.leftContent}>
                <View style={styles.circle} />
                <View style={styles.infoContainer}>
                    <Text style={styles.itemTitle}>{combination}</Text>
                    {!!supplier && (
                        <Text style={styles.itemSubTitle}>{supplier}</Text>
                    )}
                    {!!createdAt && (
                        <Text style={styles.itemSubTitle}>Criada em {createdAt}</Text>
                    )}
                    {!!delivery && (
                        <Text style={styles.itemSubTitle}>{delivery}</Text>
                    )}
                </View>
            </View>
            <View style={styles.rightContent}>
                <View style={{ alignItems: 'flex-end' }}>
                    {totalValue !== undefined && (
                        <Text style={styles.itemTotalValue}>
                            {formatCurrency(totalValue)}
                        </Text>
                    )}
                    {missingItems !== undefined && (
                        <Text style={styles.itemMissing}>
                            {`${missingItems} faltante${missingItems !== 1 ? 's' : ''}`}
                        </Text>
                    )}
                </View>
                <Icons name="chevron-forward" size={20} />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        marginRight: 12,
    },
    infoContainer: {
        flexShrink: 1,
        gap: 4
    },
    itemTitle: {
        fontSize: 16,
        color: '#000',
    },
    itemSubTitle: {
        fontSize: 13,
        color: '#555',
        marginTop: 4,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemTotalValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'right',
    },
    itemMissing: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
})

export default CustomListItem;