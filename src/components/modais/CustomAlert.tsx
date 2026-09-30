import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, DimensionValue } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  buttonText?: string;
  width?: DimensionValue;
  color?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onConfirm,
  buttonText = 'Fechar',
  width = '80%',
  color = 'red',
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onConfirm}>
      <View style={styles.overlay}>
        <View testID="alerta-customizado" style={[styles.alertContainer, { width }]}>
          <Text testID="alerta-titulo" style={styles.title}>
            {title}
          </Text>
          <Text testID="alerta-mensagem" style={styles.message}>
            {message}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  button: {
    backgroundColor: '#04BF7B',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    zIndex: 9999,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CustomAlert;
