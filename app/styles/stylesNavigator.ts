import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 55,
        borderTopWidth: 0.2,
        borderTopColor: 'lightgray',
        backgroundColor: 'white',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    navText: {
        fontSize: 12,
        color: '#04BF7B',
    },
});

export default styles

