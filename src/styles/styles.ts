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
        borderRadius: 5,
        paddingHorizontal: 10, // Reduzido para dar mais espaço ao campo de busca
        marginBottom: 20,
        marginTop: 20,
        width: '100%', // Garante que o contêiner ocupe toda a largura
    },
    searchInput: {
        flex: 1,
        height: 35,
        fontSize: 14,
        color: '#000',
        marginLeft: 8, // Espaçamento entre o ícone e o texto
        minWidth: 200, // Largura mínima para garantir que o campo seja visível
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

    leftContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 1, // Ocupa mais espaço
        marginRight: 8, // Espaçamento entre os contêineres
    },
    rightContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        flex: 1, // Ocupa mais espaço
        marginLeft: 8, // Espaçamento entre os contêineres
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Alinha o checkbox e o texto verticalmente
        marginLeft: 8, // Espaçamento entre o checkbox e os outros elementos
    },
    orderId: {
        fontSize: Platform.select({ web: 16, default: 14 }),
        fontWeight: 'bold',
    },
    deliveryDate: {
        fontSize: Platform.select({ web: 14, default: 12 }),
        color: '#666',
    },
    totalConectar: {
        fontSize: Platform.select({ web: 16, default: 14 }),
        fontWeight: 'bold',
    },
    supplierName: {
        fontSize: Platform.select({ web: 14, default: 12 }),
        color: '#666',
        maxWidth: 100, 
        // Largura máxima para o nome do fornecedor
        overflow: 'hidden', // Esconde o texto que ultrapassar
        //whiteSpace: 'nowrap', // Impede a quebra de linha
        //textOverflow: 'ellipsis', // Adiciona "..." ao final
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
    downloadButton: {
        backgroundColor: '#04BF7B',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 16,
        opacity: 1,
    },
    downloadButtonDisabled: {
        opacity: 0.5,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#04BF7B',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8, 
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        zIndex:100,
        marginBottom: 2,
        marginTop: 20,
        borderColor:'#F0F2F6'
    },
    picker: {
        flex: 1,
        height: 35,
        fontSize: 14,
        color: '#000',
        paddingHorizontal: 20
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },


    scrollView: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Alinha todos os elementos verticalmente
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#04BF7B',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16, // Espaçamento entre o checkbox e os dados principais
    },
    checkboxText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#04BF7B',
    },
    leftColumn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    rightColumn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    arrowIcon: {
        marginLeft: 16, // Espaçamento entre o conteúdo e o ícone de seta
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


