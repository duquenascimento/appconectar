import { StyleSheet, Platform } from 'react-native';

export const ordersScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Platform.OS === 'web' ? 24 : 16,
    backgroundColor: '#fff',
    marginTop: 10
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F6',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 20,
    width: '100%', // Garante que o contêiner ocupe toda a largura
  },
  searchIcon: {
    //marginRight: 8, // Espaçamento entre o ícone e o campo de busca
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    zIndex: 1000,
    marginBottom: 10,
    marginTop: 10,
    borderColor: '#F0F2F6',
    borderWidth: 1, // Adiciona borda para melhorar a aparência
  },
  picker: {
    flex: 1,
    height: 40, // Altura ajustada para ficar consistente com o campo de busca
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 10,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topSection: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  dropdown: {
    marginVertical: 10,
    zIndex: 1000,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16,
  },
  leftColumn: {
    marginLeft: 30,
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
    marginLeft: 16,
  },
  downloadButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    
  },
  deliveryDate: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    color: '#666',
    fontWeight: 'bold',
    paddingEnd: 60
  },
  orderId: {
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
totalConectar: {
  marginRight: 10,
  fontSize: Platform.select({ web: 16, default: 14 }),
  fontWeight: 'bold',
},
total: {
  fontSize: Platform.select({ web: 14, default: 12 }),
  color: '#666',
  maxWidth: 100, 
  // Largura máxima para o nome do fornecedor
  overflow: 'hidden', // Esconde o texto que ultrapassar
  //whiteSpace: 'nowrap', // Impede a quebra de linha
  //textOverflow: 'ellipsis', // Adiciona "..." ao final
},
  
});

export const ordersDetailsScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Platform.OS === 'web' ? 24 : 16,
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


