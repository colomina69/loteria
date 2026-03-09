import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { LucidePlus, LucideChevronRight, LucideTrash2, LucideEdit, LucideMoreVertical } from 'lucide-react-native';
import { Modal } from 'react-native';

const ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function AbonadosScreen({ navigation }) {
    const [abonados, setAbonados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [añadiendo, setAñadiendo] = useState(false);
    const [filtroLetra, setFiltroLetra] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [abonadoAEditar, setAbonadoAEditar] = useState(null);
    const [nombreEditado, setNombreEditado] = useState('');
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    useEffect(() => {
        fetchAbonados();
    }, []);

    async function fetchAbonados() {
        try {
            const { data, error } = await supabase
                .from('abonados')
                .select('*')
                .order('nombre');

            if (error) throw error;
            setAbonados(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    const abonadosFiltrados = useMemo(() => {
        if (!filtroLetra) return abonados;
        return abonados.filter(a => a.nombre.toUpperCase().startsWith(filtroLetra));
    }, [abonados, filtroLetra]);

    async function addAbonado() {
        if (!nuevoNombre.trim()) return;
        setAñadiendo(true);
        try {
            const { error } = await supabase
                .from('abonados')
                .insert([{ nombre: nuevoNombre.trim() }]);

            if (error) throw error;
            setNuevoNombre('');
            fetchAbonados();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setAñadiendo(false);
        }
    }

    async function deleteAbonado(id) {
        Alert.alert(
            'Eliminar Abonado',
            '¿Estás seguro de que quieres eliminar este abonado? Se borrarán también todos sus registros de pagos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('abonados')
                                .delete()
                                .eq('id', id);

                            if (error) throw error;
                            fetchAbonados();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    }

    async function updateAbonado() {
        if (!nombreEditado.trim() || !abonadoAEditar) return;
        setGuardandoEdicion(true);
        try {
            const { error } = await supabase
                .from('abonados')
                .update({ nombre: nombreEditado.trim() })
                .eq('id', abonadoAEditar.id);

            if (error) throw error;
            setModalVisible(false);
            setAbonadoAEditar(null);
            fetchAbonados();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setGuardandoEdicion(false);
        }
    }

    function abrirEdicion(abonado) {
        setAbonadoAEditar(abonado);
        setNombreEditado(abonado.nombre);
        setModalVisible(true);
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemWrapper}>
            <TouchableOpacity
                style={styles.itemMain}
                onPress={() => navigation.navigate('AbonadoDetalle', { abonado: item })}
            >
                <Text style={styles.itemText}>{item.nombre}</Text>
                <LucideChevronRight size={20} color={Colors.subtext} />
            </TouchableOpacity>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => abrirEdicion(item)} style={styles.actionButton}>
                    <LucideEdit size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteAbonado(item.id)} style={styles.actionButton}>
                    <LucideTrash2 size={18} color={Colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nuevo Abonado"
                    value={nuevoNombre}
                    onChangeText={setNuevoNombre}
                />
                <TouchableOpacity style={styles.addButton} onPress={addAbonado} disabled={añadiendo}>
                    {añadiendo ? <ActivityIndicator color="#fff" /> : <LucidePlus color="#fff" />}
                </TouchableOpacity>
            </View>

            <View style={styles.abcContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.abcButton, !filtroLetra && styles.abcButtonActive]}
                        onPress={() => setFiltroLetra(null)}
                    >
                        <Text style={[styles.abcText, !filtroLetra && styles.abcTextActive]}>Todas</Text>
                    </TouchableOpacity>
                    {ABC.map(letra => (
                        <TouchableOpacity
                            key={letra}
                            style={[styles.abcButton, filtroLetra === letra && styles.abcButtonActive]}
                            onPress={() => setFiltroLetra(letra)}
                        >
                            <Text style={[styles.abcText, filtroLetra === letra && styles.abcTextActive]}>{letra}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={abonadosFiltrados}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No hay abonados con la letra "{filtroLetra}"</Text>
                        </View>
                    )}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Abonado</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={nombreEditado}
                            onChangeText={setNombreEditado}
                            placeholder="Nombre del abonado"
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={updateAbonado}
                                disabled={guardandoEdicion}
                            >
                                {guardandoEdicion ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Guardar</Text>
                                )}
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
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 12,
    },
    addButton: {
        width: 50,
        height: 50,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    abcContainer: {
        marginBottom: 16,
        paddingVertical: 5,
    },
    abcButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: '#f1f5f9',
    },
    abcButtonActive: {
        backgroundColor: Colors.primary,
    },
    abcText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
    },
    abcTextActive: {
        color: '#fff',
    },
    list: {
        paddingBottom: 20,
    },
    itemWrapper: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemMain: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemActions: {
        flexDirection: 'row',
        borderLeftWidth: 1,
        borderLeftColor: Colors.border,
        paddingHorizontal: 8,
    },
    actionButton: {
        padding: 10,
    },
    itemText: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 20,
        padding: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1.5,
        borderColor: Colors.border,
        fontSize: 16,
        color: Colors.text,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'flex-end',
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginLeft: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        color: Colors.text,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: Colors.primary,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.subtext,
        textAlign: 'center',
    },
});
