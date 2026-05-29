import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
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

interface Wish { id: number; name: string; price: number; priority: string; target_amount: number; saved_amount: number; note: string; }

export default function WishlistScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency(); const c = colors;
  const [items, setItems] = useState<Wish[]>([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState(''); const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'later' | 'save'>('later');
  const [tAmount, setTAmount] = useState(''); const [saved, setSaved] = useState('0'); const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => setItems(db.getAllSync('SELECT * FROM wishlists ORDER BY price DESC LIMIT 50') as Wish[]), []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const add = () => { setError(''); if (!name.trim()) { setError('Nama barang wajib'); return; } if (!price) { setError('Harga wajib'); return; } db.runSync('INSERT INTO wishlists (name,price,priority,target_amount,saved_amount,note) VALUES (?,?,?,?,?,?)', [name, parseFloat(price), priority, tAmount ? parseFloat(tAmount) : null, parseFloat(saved||'0'), note]); setModal(false); reset(); load(); };
  const del = (id: number) => { db.runSync('DELETE FROM wishlists WHERE id=?', [id]); load(); };
  const reset = () => { setName(''); setPrice(''); setPriority('later'); setTAmount(''); setSaved('0'); setNote(''); setError(''); };

  const pLabel = (p: string) => p === 'urgent' ? 'Mendesak' : p === 'later' ? 'Nanti' : 'Nabung';
  const pColor = (p: string) => p === 'urgent' ? c.error : p === 'later' ? c.textMuted : c.warning;
  const pIcon = (p: string) => p === 'urgent' ? 'fire' : p === 'later' ? 'clock-outline' : 'piggy-bank';
  const totalWish = items.reduce((s, i) => s + i.price, 0);
  const totalSaved = items.reduce((s, i) => s + (i.saved_amount || 0), 0);

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <View><Text style={[st.title, { color: c.text }]}>Wishlist</Text><Text style={[st.sub, { color: c.textMuted }]}>{items.length} barang impian</Text></View>
        <TouchableOpacity style={[st.fab, { backgroundColor: c.primary }]} onPress={() => setModal(true)}><MaterialCommunityIcons name="plus" size={28} color="#fff" /></TouchableOpacity>
      </View>

      <View style={st.sumRow}>
        <View style={[st.sumCard, { backgroundColor: c.primaryBg }]}><Text style={[st.sumVal, { color: c.primary }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalWish)}</Text><Text style={[st.sumLabel, { color: c.textMuted }]}>Total Impian</Text></View>
        <View style={[st.sumCard, { backgroundColor: c.successBg }]}><Text style={[st.sumVal, { color: c.success }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalSaved)}</Text><Text style={[st.sumLabel, { color: c.textMuted }]}>Terkumpul</Text></View>
      </View>

      <FlatList data={items} keyExtractor={i => i.id.toString()} contentContainerStyle={st.list}
        renderItem={({ item }) => (
          <View style={[st.card, { backgroundColor: c.surface }]}>
            <View style={st.cardTop}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                  <MaterialCommunityIcons name={pIcon(item.priority)} size={18} color={pColor(item.priority)} />
                  <Text style={[st.cardTitle, { color: c.text }]}>{item.name}</Text>
                </View>
                {item.note ? <Text style={[st.cardNote, { color: c.textMuted }]}>{item.note}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => del(item.id)} style={st.iconBtn}><MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} /></TouchableOpacity>
            </View>
            <View style={st.priceRow}><Text style={[st.priceLabel, { color: c.textMuted }]}>Target</Text><Text style={[st.priceVal, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(item.price)}</Text></View>
            {item.target_amount > 0 && <View style={[st.progBg, { backgroundColor: c.gray100 }]}><View style={[st.progFill, { width: `${Math.min((item.saved_amount / item.target_amount) * 100, 100)}%`, backgroundColor: c.primary }]} /></View>}
            <View style={[st.badge, { backgroundColor: pColor(item.priority) + '20' }]}><Text style={[st.badgeText, { color: pColor(item.priority) }]}>{pLabel(item.priority)}</Text></View>
          </View>)}
        ListEmptyComponent={<View style={st.empty}><MaterialCommunityIcons name="star-outline" size={72} color={c.textMuted} /><Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Wishlist</Text><Text style={[st.emptyDesc, { color: c.textMuted }]}>Tap + untuk menambah barang impian</Text></View>} />

      <ModalForm visible={modal} title="Tambah Wishlist" onClose={() => setModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}><Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} /><Button title="Simpan" style={{ flex: 1 }} onPress={add} /></View>}>
        <Input label="Nama Barang" value={name} onChangeText={setName} placeholder="Contoh: iPhone 15" error={error} />
        <Input label="Harga" icon="currency-usd" keyboardType="numeric" value={price} onChangeText={setPrice} placeholder="0" />
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
          <Text style={[st.label, { color: c.textSecondary }]}>Prioritas</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
            {(['urgent', 'later', 'save'] as const).map(p => (
              <TouchableOpacity key={p} style={[st.pBtn, priority === p && { backgroundColor: c.bg, borderColor: c.primary }]} onPress={() => setPriority(p)}>
                <MaterialCommunityIcons name={pIcon(p)} size={18} color={priority === p ? pColor(p) : c.textMuted} />
                <Text style={[st.pBtnText, { color: priority === p ? pColor(p) : c.textMuted }]}>{pLabel(p)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Input label="Target Tabungan (opsional)" keyboardType="numeric" value={tAmount} onChangeText={setTAmount} placeholder="0" />
        <Input label="Sudah Terkumpul" keyboardType="numeric" value={saved} onChangeText={setSaved} placeholder="0" />
        <Input label="Catatan" value={note} onChangeText={setNote} placeholder="Kenapa kamu ingin ini?" />
      </ModalForm>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  title: { ...Typography.h2 }, sub: { ...Typography.caption, marginTop: Spacing.xs },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  sumRow: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  sumCard: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  sumVal: { ...Typography.h4, marginBottom: Spacing.xs }, sumLabel: { ...Typography.caption },
  list: { padding: Spacing.lg },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  cardTitle: { ...Typography.smallBold }, cardNote: { ...Typography.caption, marginTop: Spacing.xs },
  iconBtn: { padding: Spacing.xs, minWidth: 36, minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  priceLabel: { ...Typography.caption }, priceVal: { ...Typography.h4 },
  progBg: { height: 6, borderRadius: 3, marginBottom: Spacing.md, overflow: 'hidden' },
  progFill: { height: 6, borderRadius: 3 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  badgeText: { ...Typography.caption, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center' },
  label: { ...Typography.smallBold },
  pBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: BorderRadius.md, minHeight: 48 },
  pBtnText: { ...Typography.caption, fontWeight: '600' },
});
