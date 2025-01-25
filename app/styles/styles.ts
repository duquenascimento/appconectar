import { StyleSheet, Platform } from 'react-native';

export const ordersScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Platform.OS === 'web' ? 24 : 16,
        backgroundColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: '#000',
    },
    searchIcon: {
        marginLeft: 8,
    },
    stackContainer: {
        flex: 1,
        minHeight: Platform.OS === 'web' ? 80 : 60,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: '#F0F2F6',
        marginBottom: 8,
    },
    stackContainerWeb: Platform.select({
        web: {
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            ':hover': {
                backgroundColor: '#F0F2F6',
            },
        },
        default: {}, // Estilo vazio para outras plataformas
    }),
    itemContainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Platform.OS === 'web' ? 16 : 8,
        flexDirection: 'row',
        minHeight: Platform.OS === 'web' ? 80 : 60,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    leftContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    rightContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    orderId: {
        fontSize: Platform.OS === 'web' ? 16 : 14,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: Platform.OS === 'web' ? 14 : 12,
        color: '#666',
    },
    totalConectar: {
        fontSize: Platform.OS === 'web' ? 16 : 14,
        fontWeight: 'bold',
    },
    supplierName: {
        fontSize: Platform.OS === 'web' ? 14 : 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});


export const ordersDetailsScreenStyles = StyleSheet.create({
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