import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import db from '../../database';
import { useColors } from '../../hooks/useColors';
import { useCurrency } from '../../hooks/useCurrency';
import { Spacing, BorderRadius, Typography } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ModalForm from '../../components/ModalForm';
import DatePicker from '../../components/DatePicker';

interface Tx { id: number; amount: number; category_id: number; type: string; date: string; note: string; category_name?: string; color?: string; }
interface Cat { id: number; name: string; type: string; color: string; }

export default function FinanceScreen() {
  const { colors } = useColors();
  const { format: fmt } = useCurrency();
  const c = colors;

  const [txs, setTxs] = useState<Tx[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selCat, setSelCat] = useState<number | null>(null);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const loadTxs = useCallback(() => {
    setTxs(db.getAllSync(`SELECT t.*, c.name as category_name, c.color FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ORDER BY t.date DESC, t.created_at DESC LIMIT 50`) as Tx[]);
  }, []);

  const loadCats = (t: string) => {
    setCats(db.getAllSync(`SELECT * FROM categories WHERE type = ? OR type = "both"`, [t]) as Cat[]);
  };

  useFocusEffect(useCallback(() => { loadTxs(); loadCats(type); }, [type]));

  const addTx = () => {
    setError('');
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) { setError('Jumlah tidak valid'); return; }
    if (!selCat) { setError('Pilih kategori'); return; }
    db.runSync('INSERT INTO transactions (amount, category_id, type, date, note) VALUES (?, ?, ?, ?, ?)', [a, selCat, type, date, note]);
    setModal(false); setAmount(''); setNote(''); setSelCat(null); setError(''); loadTxs();
  };

  const delTx = (id: number) => { db.runSync('DELETE FROM transactions WHERE id = ?', [id]); loadTxs(); };

  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <View>
          <Text style={[st.title, { color: c.text }]}>Keuangan</Text>
          <Text style={[st.sub, { color: c.textMuted }]}>{txs.length} transaksi</Text>
        </View>
        <TouchableOpacity style={[st.fab, { backgroundColor: c.primary }]} onPress={() => setModal(true)}>
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={st.summaryRow}>
        <View style={[st.summary, { backgroundColor: c.successBg }]}>
          <Text style={[st.summaryVal, { color: c.success }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalIncome)}</Text>
          <Text style={[st.summaryLabel, { color: c.textMuted }]}>Pemasukan</Text>
        </View>
        <View style={[st.summary, { backgroundColor: c.errorBg }]}>
          <Text style={[st.summaryVal, { color: c.error }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalExpense)}</Text>
          <Text style={[st.summaryLabel, { color: c.textMuted }]}>Pengeluaran</Text>
        </View>
      </View>

      <FlatList
        data={txs} keyExtractor={i => i.id.toString()}
        contentContainerStyle={st.list}
        renderItem={({ item }) => (
          <View style={[st.card, { backgroundColor: c.surface }]}>
            <View style={[st.dot, { backgroundColor: item.color || c.gray300 }]} />
            <View style={st.cardBody}>
              <View style={st.cardRow}>
                <Text style={[st.cardCat, { color: c.text }]}>{item.category_name}</Text>
                <Text style={[st.cardAmount, { color: item.type === 'income' ? c.success : c.error }]} numberOfLines={1} adjustsFontSizeToFit>
                  {item.type === 'income' ? '+' : '-'}{fmt(item.amount)}
                </Text>
              </View>
              {item.note ? <Text style={[st.cardNote, { color: c.textMuted }]}>{item.note}</Text> : null}
              <View style={st.cardRow}>
                <Text style={[st.cardDate, { color: c.textMuted }]}>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text>
                <TouchableOpacity onPress={() => delTx(item.id)} style={st.delBtn}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={st.empty}>
            <MaterialCommunityIcons name="wallet-outline" size={72} color={c.textMuted} />
            <Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Transaksi</Text>
            <Text style={[st.emptyDesc, { color: c.textMuted }]}>Tap + untuk menambah transaksi</Text>
          </View>
        }
      />

      <ModalForm visible={modal} title="Tambah Transaksi" onClose={() => setModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} />
          <Button title="Simpan" style={{ flex: 1 }} onPress={addTx} />
        </View>}>
        <View style={st.typeRow}>
          {(['expense', 'income'] as const).map(t => (
            <TouchableOpacity key={t} style={[st.typeBtn, type === t && { backgroundColor: c.primary, borderColor: c.primary }]}
              onPress={() => { setType(t); setSelCat(null); loadCats(t); }}>
              <MaterialCommunityIcons name={t === 'expense' ? 'arrow-down' : 'arrow-up'} size={18} color={type === t ? '#fff' : c.textMuted} />
              <Text style={[st.typeText, { color: type === t ? '#fff' : c.textMuted }]}>{t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[st.label, { color: c.textSecondary }]}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
          {cats.filter(x => x.type === type || x.type === 'both').map(cat => (
            <TouchableOpacity key={cat.id} style={[st.chip, selCat === cat.id && { backgroundColor: c.primaryBg, borderColor: c.primary }]}
              onPress={() => setSelCat(cat.id)}>
              <View style={[st.chipDot, { backgroundColor: cat.color }]} />
              <Text style={[st.chipText, selCat === cat.id && { color: c.primary, fontWeight: '600' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Input label="Jumlah" icon="currency-usd" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0" error={error} />
        <Input label="Catatan" value={note} onChangeText={setNote} placeholder="Tambahkan catatan..." />
        <DatePicker label="Tanggal" value={date} onChange={setDate} />
      </ModalForm>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  title: { ...Typography.h2 }, sub: { ...Typography.caption, marginTop: Spacing.xs },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  summary: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  summaryVal: { ...Typography.h4, marginBottom: Spacing.xs },
  summaryLabel: { ...Typography.caption },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: { flexDirection: 'row', borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden' },
  dot: { width: 5 },
  cardBody: { flex: 1, padding: Spacing.lg },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCat: { ...Typography.smallBold },
  cardAmount: { ...Typography.bodyBold },
  cardNote: { ...Typography.caption, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  cardDate: { ...Typography.caption },
  delBtn: { padding: Spacing.xs, minWidth: 32, minHeight: 32, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 14, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: BorderRadius.md, minHeight: 48 },
  typeText: { ...Typography.smallBold },
  label: { ...Typography.smallBold, marginBottom: Spacing.sm, paddingHorizontal: Spacing.xl },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: BorderRadius.full, marginLeft: 8, minHeight: 40, backgroundColor: '#fff' },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { ...Typography.small, color: '#9CA3AF' },
});
