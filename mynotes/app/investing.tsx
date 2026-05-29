import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import { fetchCryptoPrice, fetchGoldPrice, fetchStockPrice } from '../services/api';

interface Invest { id: number; asset_name: string; asset_type: string; units: number; buy_price: number; total_invest: number; current_price: number | null; note: string; date: string; }

export default function InvestingScreen() {
  const { colors } = useColors(); const { format: fmt, code } = useCurrency(); const c = colors;
  const [items, setItems] = useState<Invest[]>([]);
  const [modal, setModal] = useState(false);
  const [assetName, setAssetName] = useState(''); const [assetType, setAssetType] = useState('crypto');
  const [units, setUnits] = useState(''); const [buyPrice, setBuyPrice] = useState(''); const [totalInvest, setTotalInvest] = useState('');
  const [note, setNote] = useState(''); const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(() => setItems(db.getAllSync('SELECT * FROM investings ORDER BY date DESC') as Invest[]), []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = () => {
    setError('');
    if (!assetName.trim()) { setError('Nama aset wajib'); return; }
    if (!units || !buyPrice) { setError('Units & buy price wajib'); return; }
    const total = totalInvest || (parseFloat(units) * parseFloat(buyPrice));
    if (editingId) {
      db.runSync('UPDATE investings SET asset_name=?, asset_type=?, units=?, buy_price=?, total_invest=?, note=?, date=? WHERE id=?',
        [assetName, assetType, parseFloat(units), parseFloat(buyPrice), parseFloat(total), note, date, editingId]);
    } else {
      db.runSync('INSERT INTO investings (asset_name, asset_type, units, buy_price, total_invest, current_price, note, date) VALUES (?,?,?,?,?,?,?,?)',
        [assetName, assetType, parseFloat(units), parseFloat(buyPrice), parseFloat(total), null, note, date]);
    }
    setModal(false); reset(); load();
  };
  const del = (id: number) => { db.runSync('DELETE FROM investings WHERE id = ?', [id]); load(); };
  const edit = (item: Invest) => {
    setEditingId(item.id); setAssetName(item.asset_name); setAssetType(item.asset_type);
    setUnits(String(item.units)); setBuyPrice(String(item.buy_price));
    setTotalInvest(String(item.total_invest)); setNote(item.note || ''); setDate(item.date);
    setModal(true);
  };
  const reset = () => { setEditingId(null); setAssetName(''); setUnits(''); setBuyPrice(''); setTotalInvest(''); setNote(''); setDate(new Date().toISOString().split('T')[0]); setError(''); };

  const updatePrices = async () => {
    setUpdating(true);
    const nameMap: Record<string, string> = { usdt: 'tether', usdc: 'usd-coin', bnb: 'bnb', xrp: 'ripple', eth: 'ethereum', sol: 'solana', btc: 'bitcoin' };
    for (const item of items) {
      if (item.asset_type === 'crypto' || item.asset_type === 'bitcoin') {
        const n = item.asset_name.toLowerCase().trim();
        const id = nameMap[n] || n.replace(/\s+/g, '-');
        const prices = await fetchCryptoPrice([id], code);
        if (prices[id] && prices[id] > 0) db.runSync('UPDATE investings SET current_price = ? WHERE id = ?', [prices[id], item.id]);
      } else if (item.asset_type === 'gold') {
        const price = await fetchGoldPrice(code);
        if (price > 0) db.runSync('UPDATE investings SET current_price = ? WHERE id = ?', [price, item.id]);
      } else if (item.asset_type === 'stock') {
        const symbol = item.asset_name.toUpperCase().trim();
        const price = await fetchStockPrice(symbol + '.JK');
        if (price > 0) db.runSync('UPDATE investings SET current_price = ? WHERE id = ?', [price, item.id]);
      }
    }
    setUpdating(false);
    load();
  };

  const totalInvested = items.reduce((s, i) => s + i.total_invest, 0);
  const totalCurrent = items.reduce((s, i) => s + ((i.current_price || i.buy_price) * i.units), 0);
  const pl = totalCurrent - totalInvested;

  const types = ['crypto', 'gold', 'stock', 'other'];
  const typeIcons: Record<string, string> = { crypto: 'bitcoin', gold: 'gold', stock: 'chart-line', other: 'dots-horizontal' };

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={st.back}><MaterialCommunityIcons name="arrow-left" size={24} color={c.text} /></TouchableOpacity>
        <Text style={[st.title, { color: c.text }]}>Investasi</Text>
        <TouchableOpacity style={st.back} onPress={() => { reset(); setModal(true); }}><MaterialCommunityIcons name="plus" size={24} color={c.primary} /></TouchableOpacity>
      </View>

      <View style={[st.sumRow, { backgroundColor: c.surface }]}>
        <View style={st.sumItem}><Text style={[st.sumLabel, { color: c.textMuted }]}>Total</Text><Text style={[st.sumVal, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalInvested)}</Text></View>
        <View style={[st.div, { backgroundColor: c.surfaceBorder }]} />
        <View style={st.sumItem}><Text style={[st.sumLabel, { color: c.textMuted }]}>Nilai Kini</Text><Text style={[st.sumVal, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalCurrent)}</Text></View>
        <View style={[st.div, { backgroundColor: c.surfaceBorder }]} />
        <View style={st.sumItem}><Text style={[st.sumLabel, { color: c.textMuted }]}>P/L</Text><Text style={[st.sumVal, { color: pl >= 0 ? c.success : c.error }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(pl)}</Text></View>
      </View>

      <TouchableOpacity style={[st.updateBtn, { backgroundColor: c.primaryBg, borderColor: c.primary }]} onPress={updatePrices} disabled={updating}>
        {updating ? <ActivityIndicator color={c.primary} /> : <MaterialCommunityIcons name="refresh" size={18} color={c.primary} />}
        <Text style={{ fontSize: 14, fontWeight: '600', color: c.primary }}>{updating ? 'Memperbarui...' : 'Update Harga'}</Text>
      </TouchableOpacity>

      <FlatList data={items} keyExtractor={i => i.id.toString()} contentContainerStyle={st.list}
        renderItem={({ item }) => {
          const hasLive = item.current_price !== null && item.current_price !== undefined && item.current_price > 0;
          const currentVal = hasLive ? item.current_price! * item.units : item.total_invest;
          const profit = currentVal - item.total_invest;
          return (
            <View style={[st.card, { backgroundColor: c.surface }]}>
              <View style={st.cardTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                  <MaterialCommunityIcons name={typeIcons[item.asset_type] || 'dots-horizontal'} size={20} color={c.primary} />
                  <View>
                    <Text style={[st.assetName, { color: c.text }]}>{item.asset_name}</Text>
                    <Text style={[st.assetType, { color: c.textMuted }]}>{item.asset_type}{hasLive ? ' • Live' : ''}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                  <TouchableOpacity onPress={() => edit(item)} style={st.iconBtn}><MaterialCommunityIcons name="pencil-outline" size={18} color={c.textSecondary} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => del(item.id)} style={st.iconBtn}><MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} /></TouchableOpacity>
                </View>
              </View>
              <View style={st.detailRow}>
                <Text style={[st.detail, { color: c.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>{item.units} unit @ {fmt(item.buy_price)}</Text>
                <Text style={[st.plText, { color: profit >= 0 ? c.success : c.error }]} numberOfLines={1} adjustsFontSizeToFit>{profit >= 0 ? '+' : ''}{fmt(profit)}</Text>
              </View>
              {hasLive ? (
                <View style={st.liveRow}>
                  <MaterialCommunityIcons name="chart-timeline-variant" size={14} color={c.info} />
                  <Text style={{ fontSize: 12, color: c.info }}>{fmt(item.current_price!)} / unit</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted }}> • Nilai: {fmt(currentVal)}</Text>
                </View>
              ) : null}
              {item.note ? <Text style={[st.note, { color: c.textMuted }]}>{item.note}</Text> : null}
            </View>
          );
        }}
        ListEmptyComponent={<View style={st.empty}><MaterialCommunityIcons name="chart-line" size={64} color={c.textMuted} /><Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Investasi</Text></View>} />

      <ModalForm visible={modal} title={editingId ? 'Edit Investasi' : 'Tambah Investasi'} onClose={() => setModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}><Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} /><Button title="Simpan" style={{ flex: 1 }} onPress={save} /></View>}>
        <Input label="Nama Aset" value={assetName} onChangeText={setAssetName} placeholder="Bitcoin, USDT, Gold" error={error} />
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>Tipe</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {types.map(t => (
              <TouchableOpacity key={t} style={[st.chip, { borderColor: '#E5E7EB' }, assetType === t && { backgroundColor: c.primaryBg, borderColor: c.primary }]} onPress={() => setAssetType(t)}>
                <Text style={[st.chipText, { color: assetType === t ? c.primary : c.textMuted }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Input label="Jumlah Unit" keyboardType="numeric" value={units} onChangeText={setUnits} placeholder="0" />
        <Input label="Harga Beli per Unit (Rp)" keyboardType="numeric" value={buyPrice} onChangeText={setBuyPrice} placeholder="0" />
        <Input label="Total Invest (Rp, opsional)" keyboardType="numeric" value={totalInvest} onChangeText={setTotalInvest} placeholder="Otomatis jika kosong" />
        <Input label="Catatan" value={note} onChangeText={setNote} placeholder="Catatan..." />
        <DatePicker label="Tanggal" value={date} onChange={setDate} />
      </ModalForm>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  back: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3 },
  sumRow: { flexDirection: 'row', padding: Spacing.lg, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, marginTop: Spacing.lg },
  sumItem: { flex: 1, alignItems: 'center' },
  sumLabel: { ...Typography.caption, marginBottom: Spacing.xs }, sumVal: { ...Typography.h4 },
  div: { width: 1, marginHorizontal: Spacing.md },
  updateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginTop: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 2, minHeight: 48 },
  list: { padding: Spacing.lg },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  assetName: { ...Typography.smallBold }, assetType: { ...Typography.caption, marginTop: 2 },
  iconBtn: { padding: Spacing.xs, minWidth: 36, minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  detail: { ...Typography.caption }, plText: { ...Typography.smallBold },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  note: { ...Typography.caption, marginTop: Spacing.xs },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg },
  chip: { flex: 1, paddingVertical: Spacing.md, borderWidth: 2, borderRadius: BorderRadius.md, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  chipText: { ...Typography.smallBold },
});
