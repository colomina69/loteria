import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { LucidePlus, LucideList, LucideDollarSign } from 'lucide-react-native';

export default function HomeScreen() {
    const navigation = useNavigation();

    const menuItems = [
        {
            title: 'Gestionar Sorteos',
            icon: <LucideList size={32} color={Colors.primary} />,
            screen: 'Sorteos',
            description: 'Crear y ver historial de sorteos'
        },
        {
            title: 'Gestionar Abonados',
            icon: <LucidePlus size={32} color={Colors.primary} />,
            screen: 'Abonados',
            description: 'Añadir o eliminar abonados'
        },
        {
            title: 'Registrar Pagos',
            icon: <LucideDollarSign size={32} color={Colors.success} />,
            screen: 'Pagos',
            description: 'Marcar pagos de sorteos activos'
        }
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
        >
            <View style={styles.iconContainer}>{item.icon}</View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lotería Benicolo</Text>
                <Text style={styles.headerSubtitle}>Panel de Control</Text>
            </View>

            <FlatList
                data={menuItems}
                renderItem={renderItem}
                keyExtractor={item => item.screen}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: Colors.subtext,
    },
});
