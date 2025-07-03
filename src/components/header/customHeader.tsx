import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icons from '@expo/vector-icons/Ionicons'
import { Text, View } from 'tamagui';

interface HeaderProps {
    title: string;
    onBackPress: () => void;
}

const CustomHeader: React.FC<HeaderProps> = ({ title, onBackPress }) => {
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Icons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        color: '#000',
        textAlign: 'left',
        flex: 1,
    },
    placeholder: {
        width: 34,
    },
})

export default CustomHeader;