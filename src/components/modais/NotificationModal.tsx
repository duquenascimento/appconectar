import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNotifications } from '../../contexts/notification.context';

export const NotificationModal: React.FC = () => {
  const {
    currentNotification,
    hasNotifications,
    nextNotification,
    prevNotification,
    dismissAllNotifications,
    currentIndex,
    totalNotifications,
  } = useNotifications();

  const isLastMessage = currentIndex === totalNotifications - 1;

  if (!hasNotifications || !currentNotification) return null;

  const getHeaderColor = () => {
    switch (currentNotification.notificationType) {
      case 'ERROR':
        return { color: '#d11b1b', header: 'Erro' };
      case 'WARN':
        return { color: '#F59E0B', header: 'Aviso' };
      case 'ALERT':
        return { color: '#f85151', header: 'Alerta' };
      default:
        return { color: '#10B981', header: 'Info' }; // INFO
    }
  };

  return (
    <Modal transparent animationType="fade" visible={hasNotifications}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.header, { backgroundColor: getHeaderColor().color }]}>
            <Text style={styles.headerText}>{getHeaderColor().header}</Text>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {totalNotifications}
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{currentNotification.title}</Text>
            <Text style={styles.message}>{currentNotification.message}</Text>
            <Text style={styles.footer}>{currentNotification.footer}</Text>
          </View>

          <View style={styles.actions}>
            {currentIndex > 0 ? (
              <TouchableOpacity style={styles.button} onPress={prevNotification}>
                <Text style={styles.buttonText}>Anterior</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.spacer} />
            )}

            {isLastMessage ? (
              <TouchableOpacity
                style={[styles.button, styles.okButton]}
                onPress={dismissAllNotifications}
              >
                <Text style={styles.okButtonText}>Ok, entendi</Text>
              </TouchableOpacity>
            ) : (
              <></>
            )}

            {!isLastMessage ? (
              <TouchableOpacity style={styles.button} onPress={nextNotification}>
                <Text style={styles.buttonText}>Próximo</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.spacer} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    maxWidth: '600px',
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  counterText: { color: '#fff', fontSize: 12 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  message: { fontSize: 16, color: '#666', marginBottom: 12 },
  footer: { fontSize: 11, color: '#999', fontStyle: 'italic' },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    justifyContent: 'space-between',
  },
  button: { padding: 8 },
  buttonText: { color: '#007AFF', fontWeight: '600' },
  okButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  okButtonText: { color: '#fff', fontWeight: 'bold' },
  spacer: { width: 60 },
});
