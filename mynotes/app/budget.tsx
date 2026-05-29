import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
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

interface Budget { id: number; category_id: number; amount: number; month: string; category_name?: string; category_color?: string; }
interface Cat { id: number; name: string; color: string; }

export default function BudgetScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency(); const c = colors;
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [modal, setModal] = useState(false);
  const [selCat, setSelCat] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setBudgets(db.getAllSync(`SELECT b.*, c.name as category_name, c.color as category_color FROM budgets b LEFT JOIN categories c ON b.category_id = c.id ORDER BY b.month DESC, c.name`) as Budget[]);
    setCats(db.getAllSync(`SELECT * FROM categories WHERE type = 'expense' OR type = 'both' ORDER BY name`) as Cat[]);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const save = () => {
    setError('');
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) { setError('Jumlah budget tidak valid'); return; }
    if (!selCat) { setError('Pilih kategori'); return; }
    if (editingId) {
      db.runSync('UPDATE budgets SET category_id=?, amount=?, month=? WHERE id=?', [selCat, a, month, editingId]);
    } else {
      db.runSync('INSERT INTO budgets (category_id, amount, month) VALUES (?, ?, ?)', [selCat, a, month]);
    }
    setModal(false); reset(); load();
  };

  const del = (id: number) => { db.runSync('DELETE FROM budgets WHERE id=?', [id]); load(); };
  const edit = (b: Budget) => { setSelCat(b.category_id); setAmount(b.amount.toString()); setMonth(b.month); setEditingId(b.id); setModal(true); };
  const reset = () => { setSelCat(null); setAmount(''); setMonth(new Date().toISOString().slice(0, 7)); setEditingId(null); setError(''); };

  const getSpent = (catId: number, m: string) => {
    const r = db.getAllSync("SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE category_id=? AND strftime('%Y-%m', date)=?", [catId, m]) as any[];
    return r[0]?.t || 0;
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <View style={[s.c, { backgroundColor: c.bg }]}>
      <View style={[s.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><MaterialCommunityIcons name="arrow-left" size={24} color={c.text} /></TouchableOpacity>
        <Text style={[s.title, { color: c.text }]}>Budget</Text>
        <TouchableOpacity style={s.back} onPress={() => { reset(); setModal(true); }}><MaterialCommunityIcons name="plus" size={24} color={c.primary} /></TouchableOpacity>
      </View>

      <FlatList
        data={budgets.filter(b => b.month === currentMonth)}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const spent = getSpent(item.category_id, item.month);
          const pct = Math.min((spent / item.amount) * 100, 100);
          const remaining = item.amount - spent;
          return (
            <TouchableOpacity style={[s.card, { backgroundColor: c.surface }]} onPress={() => edit(item)}>
              <View style={s.cardTop}>
                <View style={s.cardLeft}>
                  <View style={[s.dot, { backgroundColor: item.category_color || c.gray300 }]} />
                  <Text style={[s.cardTitle, { color: c.text }]}>{item.category_name || 'Umum'}</Text>
                </View>
                <TouchableOpacity onPress={() => del(item.id)} style={s.iconBtn}><MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} /></TouchableOpacity>
              </View>
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${pct}%`, backgroundColor: remaining < 0 ? c.error : remaining < item.amount * 0.2 ? c.warning : c.success }]} />
              </View>
              <View style={s.cardBottom}>
                <Text style={[s.spentText, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(spent)} / {fmt(item.amount)}</Text>
                <Text style={[s.remainText, { color: remaining < 0 ? c.error : c.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>{remaining < 0 ? `Over ${fmt(Math.abs(remaining))}` : `Sisa ${fmt(remaining)}`}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <MaterialCommunityIcons name="calculator-variant" size={64} color={c.textMuted} />
            <Text style={[s.emptyTitle, { color: c.text }]}>Belum Ada Budget</Text>
            <Text style={[s.emptyDesc, { color: c.textMuted }]}>Tap + untuk set budget bulan ini</Text>
          </View>
        }
      />

      <ModalForm visible={modal} title={editingId ? 'Edit Budget' : 'Tambah Budget'} onClose={() => setModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}><Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} /><Button title="Simpan" style={{ flex: 1 }} onPress={save} /></View>}>
        <Input label="Bulan" icon="calendar-month" value={month} onChangeText={setMonth} placeholder="YYYY-MM" />
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
          <Text style={[s.label, { color: c.textSecondary }]}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.sm }}>
            {cats.map(cat => (
              <TouchableOpacity key={cat.id} style={[s.chip, selCat === cat.id && { backgroundColor: c.primaryBg, borderColor: c.primary }]} onPress={() => setSelCat(cat.id)}>
                <View style={[s.chipDot, { backgroundColor: cat.color }]} />
                <Text style={[s.chipText, { color: selCat === cat.id ? c.primary : c.textMuted }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Input label="Jumlah Budget" icon="currency-usd" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0" error={error} />
      </ModalForm>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  back: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3 },
  list: { padding: Spacing.lg },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { ...Typography.smallBold },
  iconBtn: { padding: Spacing.xs, minWidth: 36, minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  barBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: Spacing.sm, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  spentText: { ...Typography.caption, fontWeight: '600' },
  remainText: { ...Typography.caption },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center' },
  label: { ...Typography.smallBold },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: BorderRadius.full, marginRight: 6, minHeight: 40 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { ...Typography.small, fontWeight: '600' },
});
