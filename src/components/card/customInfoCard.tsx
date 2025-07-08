import React from 'react';
import { StyleSheet } from 'react-native';
import Icons from '@expo/vector-icons/Ionicons'
import { Text, View } from 'tamagui';

interface InfoCardProps {
    title?: string;
    description?: string;
}

const CustomInfoCard: React.FC<InfoCardProps> = ({ title = '', description = '' }) => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <Icons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <Text style={styles.cardDescription}>
                {description}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 16,
        marginTop: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});

export default CustomInfoCard;