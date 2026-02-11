import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { LucideCheckCircle, LucideCircle, LucidePackage, LucideSave } from 'lucide-react-native';

const ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function PagosScreen({ route }) {
    const [sorteos, setSorteos] = useState([]);
    const [sorteoSeleccionado, setSorteoSeleccionado] = useState(route.params?.sorteo || null);
    const [abonados, setAbonados] = useState([]);
    const [pagos, setPagos] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filtroLetra, setFiltroLetra] = useState(null);
    const [idsModificados, setIdsModificados] = useState(new Set());

    useEffect(() => {
        fetchSorteos();
    }, []);

    useEffect(() => {
        if (route.params?.sorteo) {
            setSorteoSeleccionado(route.params.sorteo);
        }
    }, [route.params?.sorteo]);

    useEffect(() => {
        if (sorteoSeleccionado) {
            fetchDatosPagos();
            setIdsModificados(new Set());
        }
    }, [sorteoSeleccionado]);

    const formatDateToUI = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    async function fetchSorteos() {
        try {
            const { data, error } = await supabase
                .from('sorteos')
                .select('*')
                .order('fecha', { ascending: false });

            if (error) throw error;
            setSorteos(data);
            if (data.length > 0 && !sorteoSeleccionado) {
                setSorteoSeleccionado(data[0]);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchDatosPagos() {
        setLoading(true);
        try {
            const { data: subs, error: subsError } = await supabase
                .from('abonados')
                .select('*')
                .order('nombre');
            if (subsError) throw subsError;

            const { data: pays, error: paysError } = await supabase
                .from('pagos')
                .select('*')
                .eq('sorteo_id', sorteoSeleccionado.id);
            if (paysError) throw paysError;

            const mapaPagos = {};
            pays.forEach(p => {
                mapaPagos[p.abonado_id] = p.estado;
            });

            setAbonados(subs);
            setPagos(mapaPagos);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    function togglePago(abonadoId) {
        const estadoActual = pagos[abonadoId] || 'pending';

        let nuevoEstado;
        if (estadoActual === 'pending') {
            nuevoEstado = 'delivered';
        } else if (estadoActual === 'delivered') {
            nuevoEstado = 'paid';
        } else {
            nuevoEstado = 'pending';
        }

        setPagos(prev => ({ ...prev, [abonadoId]: nuevoEstado }));
        setIdsModificados(prev => {
            const next = new Set(prev);
            next.add(abonadoId);
            return next;
        });
    }

    async function guardarCambios() {
        if (idsModificados.size === 0) return;

        setSaving(true);
        try {
            const rowsToUpsert = Array.from(idsModificados).map(id => ({
                abonado_id: id,
                sorteo_id: sorteoSeleccionado.id,
                estado: pagos[id],
                fecha_pago: pagos[id] === 'paid' ? new Date().toISOString() : null
            }));

            const { error } = await supabase
                .from('pagos')
                .upsert(rowsToUpsert, { onConflict: 'abonado_id, sorteo_id' });

            if (error) throw error;

            setIdsModificados(new Set());
            Alert.alert('Éxito', 'Cambios guardados correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar los cambios: ' + error.message);
        } finally {
            setSaving(false);
        }
    }

    const renderSorteoItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.drawChip, sorteoSeleccionado?.id === item.id && styles.drawChipSelected]}
            onPress={() => {
                if (idsModificados.size > 0) {
                    Alert.alert('Cambios sin guardar', '¿Deseas cambiar de sorteo sin guardar los cambios actuales?', [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Sí, cambiar', onPress: () => setSorteoSeleccionado(item) }
                    ]);
                } else {
                    setSorteoSeleccionado(item);
                }
            }}
        >
            <Text style={[styles.drawText, sorteoSeleccionado?.id === item.id && styles.drawTextSelected]}>
                {item.nombre} ({formatDateToUI(item.fecha)})
            </Text>
        </TouchableOpacity>
    );

    const renderAbonadoItem = ({ item }) => {
        const estado = pagos[item.id] || 'pending';
        const modificado = idsModificados.has(item.id);

        let icon = <LucideCircle color={Colors.subtext} size={24} />;
        let rowStyle = styles.subscriberRow;
        let nameStyle = styles.subscriberName;
        let label = 'Pendiente';

        if (estado === 'delivered') {
            icon = <LucidePackage color={Colors.primary} size={24} />;
            rowStyle = [styles.subscriberRow, styles.subscriberRowDelivered];
            nameStyle = [styles.subscriberName, styles.subscriberNameDelivered];
            label = 'Entregado';
        } else if (estado === 'paid') {
            icon = <LucideCheckCircle color={Colors.success} size={24} />;
            rowStyle = [styles.subscriberRow, styles.subscriberRowPaid];
            nameStyle = [styles.subscriberName, styles.subscriberNamePaid];
            label = 'Pagado';
        }

        return (
            <TouchableOpacity
                style={rowStyle}
                onPress={() => togglePago(item.id)}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={nameStyle}>{item.nombre}</Text>
                        {modificado && <View style={styles.dotModificado} />}
                    </View>
                    <Text style={[styles.statusLabel, estado === 'delivered' && { color: Colors.primary }, estado === 'paid' && { color: Colors.success }]}>
                        {label}
                    </Text>
                </View>
                {icon}
            </TouchableOpacity>
        );
    };

    const abonadosFiltrados = useMemo(() => {
        if (!filtroLetra) return abonados;
        return abonados.filter(a => a.nombre.toUpperCase().startsWith(filtroLetra));
    }, [abonados, filtroLetra]);

    const countDelivered = Object.values(pagos).filter(s => s === 'delivered').length;
    const countPaid = Object.values(pagos).filter(s => s === 'paid').length;
    const totalCollected = countPaid * (sorteoSeleccionado?.precio || 0);

    return (
        <View style={styles.container}>
            <View style={styles.drawSelector}>
                <FlatList
                    horizontal
                    data={sorteos}
                    renderItem={renderSorteoItem}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.drawList}
                />
            </View>

            {sorteoSeleccionado && (
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Entregados</Text>
                        <Text style={styles.statValue}>{countDelivered}</Text>
                        <Text style={styles.statSub}>décimos</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#cad5e2' }]}>
                        <Text style={[styles.statLabel, { color: Colors.success }]}>Pagados</Text>
                        <Text style={[styles.statValue, { color: Colors.success }]}>{countPaid}</Text>
                        <Text style={styles.statSub}>cobrados</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: Colors.success }]}>Total</Text>
                        <Text style={[styles.statValue, { color: Colors.success }]}>{totalCollected}€</Text>
                        <Text style={styles.statSub}>en caja</Text>
                    </View>
                </View>
            )}

            <View style={styles.abcContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.abcList}>
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

            {loading && abonados.length === 0 ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={abonadosFiltrados}
                    renderItem={renderAbonadoItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.subscriberList}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No hay abonados con la letra "{filtroLetra}"</Text>
                        </View>
                    )}
                />
            )}

            {idsModificados.size > 0 && (
                <View style={styles.saveContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={guardarCambios}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <LucideSave color="#fff" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Guardar {idsModificados.size} cambios</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    drawSelector: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    drawList: {
        paddingHorizontal: 16,
    },
    drawChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.background,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    drawChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    drawText: {
        color: Colors.text,
        fontWeight: '500',
    },
    drawTextSelected: {
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        justifyContent: 'space-around',
        elevation: 2,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.primary,
    },
    statSub: {
        fontSize: 10,
        color: Colors.subtext,
    },
    abcContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    abcList: {
        paddingHorizontal: 16,
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
    subscriberList: {
        padding: 16,
        paddingBottom: 80, // Espacio para el botón de guardar
    },
    subscriberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    subscriberRowDelivered: {
        borderColor: Colors.primary,
        backgroundColor: '#f0f9ff',
    },
    subscriberRowPaid: {
        borderColor: Colors.success,
        backgroundColor: '#f0fdf4',
    },
    subscriberName: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
    },
    subscriberNameDelivered: {
        color: Colors.primary,
    },
    subscriberNamePaid: {
        color: Colors.success,
    },
    dotModificado: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f59e0b',
        marginLeft: 8,
    },
    statusLabel: {
        fontSize: 12,
        color: Colors.subtext,
        marginTop: 2,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.subtext,
        textAlign: 'center',
    },
    saveContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    saveButton: {
        backgroundColor: '#059669', // Color verde oscuro
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
