import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { LucidePlus, LucideCalendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SorteosScreen({ navigation }) {
    const [sorteos, setSorteos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchSorteos();
        });
        return unsubscribe;
    }, [navigation]);

    async function fetchSorteos() {
        try {
            const { data, error } = await supabase
                .from('sorteos')
                .select('*, pagos(estado)')
                .order('fecha', { ascending: false });

            if (error) throw error;
            setSorteos(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    // Formatear Date a dd-mm-yyyy (UI)
    const formatDateToUI = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Formatear Date a yyyy-mm-dd (DB)
    const formatDateToDB = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || fecha;
        setShowDatePicker(Platform.OS === 'ios');
        setFecha(currentDate);
    };

    async function createSorteo() {
        if (!nombre.trim() || !precio) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            const { error } = await supabase
                .from('sorteos')
                .insert([{
                    nombre: nombre.trim(),
                    precio: parseFloat(precio),
                    fecha: formatDateToDB(fecha)
                }]);

            if (error) throw error;
            setModalVisible(false);
            setNombre('');
            setPrecio('');
            setFecha(new Date());
            fetchSorteos();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const renderItem = ({ item }) => {
        const countDelivered = item.pagos?.filter(p => p.estado === 'delivered').length || 0;
        const countPaid = item.pagos?.filter(p => p.estado === 'paid').length || 0;
        const totalCollected = countPaid * item.precio;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Pagos', { sorteo: item })}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    <Text style={styles.cardPrice}>{item.precio} €</Text>
                </View>

                <View style={styles.cardStatsRow}>
                    <View style={styles.cardStat}>
                        <Text style={styles.cardStatLabel}>Entregados</Text>
                        <Text style={styles.cardStatValue}>{countDelivered}</Text>
                    </View>
                    <View style={styles.cardStat}>
                        <Text style={[styles.cardStatLabel, { color: Colors.success }]}>Pagados</Text>
                        <Text style={[styles.cardStatValue, { color: Colors.success }]}>{countPaid}</Text>
                    </View>
                    <View style={styles.cardStat}>
                        <Text style={[styles.cardStatLabel, { color: Colors.success }]}>Total</Text>
                        <Text style={[styles.cardStatValue, { color: Colors.success }]}>{totalCollected} €</Text>
                    </View>
                </View>

                <View style={styles.dateContainer}>
                    <LucideCalendar size={14} color={Colors.subtext} style={{ marginRight: 4 }} />
                    <Text style={styles.cardDate}>{formatDateToUI(item.fecha)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <LucidePlus color="#fff" size={24} />
                <Text style={styles.fabText}>Nuevo Sorteo</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
                <FlatList
                    data={sorteos}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nuevo Sorteo</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del Sorteo"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Precio (€)"
                            value={precio}
                            onChangeText={setPrecio}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <LucideCalendar size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.datePickerText}>
                                {formatDateToUI(fecha)}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={fecha}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSave]}
                                onPress={createSorteo}
                            >
                                <Text style={styles.textStyle}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 16,
    },
    list: {
        marginTop: 60,
    },
    fab: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    cardPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.success,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardDate: {
        color: Colors.subtext,
        fontSize: 14,
    },
    cardStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    cardStat: {
        alignItems: 'center',
        flex: 1,
    },
    cardStatLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.primary,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    cardStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    datePickerButton: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
        color: Colors.text,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    button: {
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        width: '48%',
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: Colors.subtext,
    },
    buttonSave: {
        backgroundColor: Colors.primary,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
    },
});
