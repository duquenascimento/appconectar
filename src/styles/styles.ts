import { StyleSheet, Platform } from 'react-native';

export const ordersScreenStyles = StyleSheet.create({
  arrowIcon: {
    marginLeft: 16,
  },
  checkboxContainer: {
    alignItems: 'center',
    borderColor: '#04BF7B',
    borderRadius: 4,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginRight: 10,
    width: 24,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 10,
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  deliveryDate: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontWeight: 'bold',
    width: 'auto',
  },
  downloadButton: {
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdown: {
    marginVertical: 10,
    zIndex: 1000,
  },
  itemContainer: {
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  leftColumn: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  orderId: {
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontWeight: 'bold',
  },
  picker: {
    flex: 1,
    height: 40, // Altura ajustada para ficar consistente com o campo de busca
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 10,
  },
  pickerContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F2F6',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
    zIndex: 1000, // Adiciona borda para melhorar a aparência
  },
  rightColumn: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'column',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#F0F2F6',
    borderRadius: 5,
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 10,
    width: '100%', // Garante que o contêiner ocupe toda a largura
  },
  searchIcon: {
    // marginRight: 8, // Espaçamento entre o ícone e o campo de busca
  },
  supplierName: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    color: '#666',
    maxWidth: 100,
    // Largura máxima para o nome do fornecedor
    overflow: 'hidden', // Esconde o texto que ultrapassar
    // whiteSpace: 'nowrap', // Impede a quebra de linha
    // textOverflow: 'ellipsis', // Adiciona "..." ao final
  },

  topSection: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  total: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    color: '#666',
    maxWidth: 100,
    // Largura máxima para o nome do fornecedor
    overflow: 'hidden', // Esconde o texto que ultrapassar
    // whiteSpace: 'nowrap', // Impede a quebra de linha
    // textOverflow: 'ellipsis', // Adiciona "..." ao final
  },
  totalConectar: {
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export const ordersDetailsScreenStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F2F6',
    flex: 1,
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
