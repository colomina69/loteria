import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { LucidePlus, LucideChevronRight } from 'lucide-react-native';

const ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function AbonadosScreen({ navigation }) {
    const [abonados, setAbonados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [añadiendo, setAñadiendo] = useState(false);
    const [filtroLetra, setFiltroLetra] = useState(null);

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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('AbonadoDetalle', { abonado: item })}
        >
            <Text style={styles.itemText}>{item.nombre}</Text>
            <LucideChevronRight size={20} color={Colors.subtext} />
        </TouchableOpacity>
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
    item: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemText: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
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
