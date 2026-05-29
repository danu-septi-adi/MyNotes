import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import db from '../database';
import { useColors } from '../hooks/useColors';
import { useCurrency } from '../hooks/useCurrency';
import { Spacing, BorderRadius, Typography } from '../constants/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import ModalForm from '../components/ModalForm';
import DatePicker from '../components/DatePicker';

interface Debt { id: number; name: string; amount: number; type: string; due_date: string; status: string; note: string; }

type Filter = 'all' | 'debt' | 'receivable';

export default function DebtsScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency(); const c = colors;
  const [debts, setDebts] = useState<Debt[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [modal, setModal] = useState(false);
  const [name, setName] = useState(''); const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(''); const [error, setError] = useState('');

  const load = useCallback(() => {
    setDebts(db.getAllSync('SELECT * FROM debts ORDER BY status, due_date ASC') as Debt[]);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const add = () => {
    setError('');
    if (!name.trim()) { setError('Nama orang wajib diisi'); return; }
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) { setError('Jumlah tidak valid'); return; }
    db.runSync('INSERT INTO debts (name, amount, type, due_date, note) VALUES (?,?,?,?,?)',
      [name, a, filter === 'all' ? 'debt' : filter, dueDate, note]);
    setModal(false); setName(''); setAmount(''); setDueDate(new Date().toISOString().split('T')[0]); setNote(''); setError(''); load();
  };

  const toggleStatus = (id: number) => {
    const item = debts.find(d => d.id === id);
    if (!item) return;
    db.runSync('UPDATE debts SET status = ? WHERE id = ?', [item.status === 'active' ? 'settled' : 'active', id]); load();
  };
  const del = (id: number) => { db.runSync('DELETE FROM debts WHERE id = ?', [id]); load(); };

  const filtered = filter === 'all' ? debts : debts.filter(d => d.type === filter);
  const activeDebt = debts.filter(d => d.type === 'debt' && d.status === 'active').reduce((s, d) => s + d.amount, 0);
  const activeReceivable = debts.filter(d => d.type === 'receivable' && d.status === 'active').reduce((s, d) => s + d.amount, 0);

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={st.back}><MaterialCommunityIcons name="arrow-left" size={24} color={c.text} /></TouchableOpacity>
        <Text style={[st.title, { color: c.text }]}>Hutang / Piutang</Text>
        <TouchableOpacity style={st.back} onPress={() => setModal(true)}><MaterialCommunityIcons name="plus" size={24} color={c.primary} /></TouchableOpacity>
      </View>

      <View style={[st.sumRow, { backgroundColor: c.surface }]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-down-bold" size={14} color={c.error} />
          <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Hutang</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.error }} numberOfLines={1} adjustsFontSizeToFit>{fmt(activeDebt)}</Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: c.surfaceBorder }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-up-bold" size={14} color={c.success} />
          <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Piutang</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.success }} numberOfLines={1} adjustsFontSizeToFit>{fmt(activeReceivable)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
        {(['all', 'debt', 'receivable'] as const).map(f => (
          <TouchableOpacity key={f} style={[st.filterChip, filter === f && { backgroundColor: c.primaryBg, borderColor: c.primary }]}
            onPress={() => setFilter(f)}>
            <Text style={[st.filterText, { color: filter === f ? c.primary : c.textMuted }]}>
              {f === 'all' ? 'Semua' : f === 'debt' ? 'Hutang' : 'Piutang'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList data={filtered} keyExtractor={i => i.id.toString()} contentContainerStyle={st.list}
        renderItem={({ item }) => {
          const isDebt = item.type === 'debt';
          const color = isDebt ? c.error : c.success;
          const overdue = item.due_date && new Date(item.due_date) < new Date() && item.status === 'active';
          return (
            <View style={[st.card, { backgroundColor: c.surface, opacity: item.status === 'settled' ? 0.5 : 1, borderLeftWidth: 4, borderLeftColor: color }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
                <TouchableOpacity onPress={() => toggleStatus(item.id)} style={{ minWidth: 32, minHeight: 32, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={item.status === 'settled' ? 'check-circle' : 'checkbox-blank-circle-outline'} size={22} color={item.status === 'settled' ? c.success : c.textMuted} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name={isDebt ? 'arrow-down-bold' : 'arrow-up-bold'} size={14} color={color} />
                    <Text style={[st.cardName, { color: c.text }]}>{item.name}</Text>
                  </View>
                  {item.note ? <Text style={[st.cardNote, { color: c.textMuted }]}>{item.note}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => del(item.id)} style={{ minWidth: 32, minHeight: 32, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[st.cardAmount, { color }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(item.amount)}</Text>
                  <View style={[st.typeBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[st.typeBadgeText, { color }]}>{isDebt ? 'Hutang' : 'Piutang'}</Text>
                  </View>
                </View>
                {item.due_date ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="calendar" size={14} color={overdue ? c.error : c.textMuted} />
                    <Text style={{ fontSize: 12, color: overdue ? c.error : c.textMuted }}>
                      {new Date(item.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                ) : null}
              </View>
              {item.status === 'settled' && <View style={[st.badge, { backgroundColor: c.successBg }]}><Text style={[st.badgeText, { color: c.success }]}>✓ Lunas</Text></View>}
            </View>
          );
        }}
        ListEmptyComponent={<View style={st.empty}><MaterialCommunityIcons name="handshake" size={64} color={c.textMuted} /><Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Data</Text></View>} />

      <ModalForm visible={modal} title="Tambah" onClose={() => setModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} />
          <Button title="Simpan" style={{ flex: 1 }} onPress={add} />
        </View>}>
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
          <Text style={{ fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Tipe</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity style={[st.typeChip, filter === 'debt' && { borderColor: c.error, backgroundColor: c.errorBg }]} onPress={() => setFilter('debt')}>
              <MaterialCommunityIcons name="arrow-down-bold" size={14} color={filter === 'debt' ? c.error : c.textMuted} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === 'debt' ? c.error : c.textMuted }}>Hutang</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.typeChip, filter === 'receivable' && { borderColor: c.success, backgroundColor: c.successBg }]} onPress={() => setFilter('receivable')}>
              <MaterialCommunityIcons name="arrow-up-bold" size={14} color={filter === 'receivable' ? c.success : c.textMuted} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === 'receivable' ? c.success : c.textMuted }}>Piutang</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Input label="Nama orang" value={name} onChangeText={setName} placeholder="Nama" error={error} />
        <Input label="Jumlah" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0" />
        <DatePicker label="Tanggal Jatuh Tempo" value={dueDate} onChange={setDueDate} />
        <Input label="Catatan" value={note} onChangeText={setNote} placeholder="Catatan..." />
      </ModalForm>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  back: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3 },
  sumRow: { flexDirection: 'row', padding: Spacing.lg, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  filterChip: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', minHeight: 40, justifyContent: 'center' },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { padding: Spacing.lg },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardName: { fontSize: 16, fontWeight: '600' },
  cardNote: { fontSize: 12, marginTop: 2 },
  cardAmount: { fontSize: 20, fontWeight: '700' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, marginTop: Spacing.sm },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderWidth: 2, borderRadius: BorderRadius.sm, minHeight: 44 },
});
