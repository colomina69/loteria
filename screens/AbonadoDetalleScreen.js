import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { LucideCheckCircle, LucideCircle, LucidePackage } from 'lucide-react-native';

export default function AbonadoDetalleScreen({ route }) {
    const { abonado } = route.params;
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistorial();
    }, []);

    async function fetchHistorial() {
        try {
            const { data, error } = await supabase
                .from('pagos')
                .select(`
                    estado,
                    metodo_pago,
                    fecha_pago,
                    sorteos (
                        nombre,
                        fecha
                    )
                `)
                .eq('abonado_id', abonado.id)
                .order('fecha_pago', { ascending: false });

            if (error) throw error;
            setHistorial(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    const formatDateToUI = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const renderItem = ({ item }) => {
        let icon = <LucideCircle color={Colors.subtext} size={24} />;
        let statusLabel = 'Pendiente';
        let statusColor = Colors.subtext;

        if (item.estado === 'delivered') {
            icon = <LucidePackage color={Colors.primary} size={24} />;
            statusLabel = 'Entregado';
            statusColor = Colors.primary;
        } else if (item.estado === 'paid') {
            icon = <LucideCheckCircle color={Colors.success} size={24} />;
            statusLabel = 'Pagado';
            statusColor = Colors.success;
        }

        return (
            <View style={styles.card}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.drawName}>{item.sorteos?.nombre}</Text>
                    <Text style={styles.drawDate}>{formatDateToUI(item.sorteos?.fecha)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Text style={[styles.statusText, { color: statusColor, marginTop: 0 }]}>{statusLabel}</Text>
                        {item.estado === 'paid' && (
                            <>
                                {item.metodo_pago && (
                                    <Text style={styles.metodoLabel}> • {item.metodo_pago === 'bizum' ? 'Bizum' : 'Efectivo'}</Text>
                                )}
                                {item.fecha_pago && (
                                    <Text style={styles.metodoLabel}> • {formatDateToUI(item.fecha_pago)}</Text>
                                )}
                            </>
                        )}
                    </View>
                </View>
                {icon}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{abonado.nombre}</Text>
                <Text style={styles.subtitle}>Historial de Sorteos</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={historial}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Este abonado no ha participado en ningún sorteo aún.</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.subtext,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    drawName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    drawDate: {
        fontSize: 14,
        color: Colors.subtext,
        marginTop: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
        textTransform: 'uppercase',
    },
    metodoLabel: {
        fontSize: 12,
        color: Colors.subtext,
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.subtext,
        textAlign: 'center',
        fontSize: 16,
    },
});
