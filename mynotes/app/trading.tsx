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

interface Trade { id: number; pair: string; volume: number; entry_price: number; stop_loss: number; take_profit: number; reason: string; result: number; status: string; date: string; }

export default function TradingScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency(); const c = colors;
  const [trades, setTrades] = useState<Trade[]>([]);
  const [modal, setModal] = useState(false);
  const [pair, setPair] = useState(''); const [volume, setVolume] = useState(''); const [entry, setEntry] = useState('');
  const [sl, setSl] = useState(''); const [tp, setTp] = useState(''); const [reason, setReason] = useState('');
  const [result, setResult] = useState(''); const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const load = useCallback(() => setTrades(db.getAllSync('SELECT * FROM tradings ORDER BY date DESC LIMIT 50') as Trade[]), []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const add = () => {
    setError('');
    if (!pair.trim()) { setError('Pair wajib diisi'); return; }
    if (!volume || !entry) { setError('Volume & entry price wajib'); return; }
    const pl = result ? parseFloat(result) : 0;
    db.runSync('INSERT INTO tradings (pair, volume, entry_price, stop_loss, take_profit, reason, result, status, date) VALUES (?,?,?,?,?,?,?,?,?)',
      [pair, parseFloat(volume), parseFloat(entry), sl ? parseFloat(sl) : null, tp ? parseFloat(tp) : null, reason, pl, pl !== 0 ? 'closed' : 'open', date]);
    setModal(false); reset(); load();
  };

  const del = (id: number) => { db.runSync('DELETE FROM tradings WHERE id = ?', [id]); load(); };
  const reset = () => { setPair(''); setVolume(''); setEntry(''); setSl(''); setTp(''); setReason(''); setResult(''); setDate(new Date().toISOString().split('T')[0]); setError(''); };

  const totalPL = trades.reduce((s, t) => s + (t.result || 0), 0);
  const winTrades = trades.filter(t => (t.result || 0) > 0).length;
  const totalTrades = trades.length;

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={st.back}><MaterialCommunityIcons name="arrow-left" size={24} color={c.text} /></TouchableOpacity>
        <Text style={[st.title, { color: c.text }]}>Jurnal Trading</Text>
        <TouchableOpacity style={st.back} onPress={() => setModal(true)}><MaterialCommunityIcons name="plus" size={24} color={c.primary} /></TouchableOpacity>
      </View>

      <View style={[st.sumRow, { backgroundColor: c.surface }]}>
        <View style={st.sumItem}><Text style={[st.sumLabel, { color: c.textMuted }]}>Total P/L</Text><Text style={[st.sumVal, { color: totalPL >= 0 ? c.success : c.error }]} numberOfLines={1} adjustsFontSizeToFit>{fmt(totalPL)}</Text></View>
        <View style={[st.div, { backgroundColor: c.surfaceBorder }]} />
        <View style={st.sumItem}><Text style={[st.sumLabel, { color: c.textMuted }]}>Win Rate</Text><Text style={[st.sumVal, { color: c.success }]}>{totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0}%</Text></View>
        <View style={[st.div, { backgroundColor: c.surfaceBorder }]} />
        <View style={st.sumItem}><Text style={[st.sumLabel, { color: c.textMuted }]}>Total Trade</Text><Text style={[st.sumVal, { color: c.text }]}>{totalTrades}</Text></View>
      </View>

      <FlatList data={trades} keyExtractor={i => i.id.toString()} contentContainerStyle={st.list}
        renderItem={({ item }) => (
          <View style={[st.card, { backgroundColor: c.surface }]}>
            <View style={st.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[st.pair, { color: c.text }]}>{item.pair}</Text>
                <Text style={[st.date, { color: c.textMuted }]}>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text>
              </View>
              <Text style={[st.pl, { color: (item.result || 0) >= 0 ? c.success : c.error }]} numberOfLines={1} adjustsFontSizeToFit>{item.result >= 0 ? '+' : ''}{fmt(item.result || 0)}</Text>
            </View>
            <View style={st.detailRow}>
              <Text style={[st.detail, { color: c.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>Entry: {fmt(item.entry_price)} | Vol: {item.volume}</Text>
              {item.reason ? <Text style={[st.detail, { color: c.textMuted }]}>{item.reason}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => del(item.id)} style={st.delBtn}><MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View style={st.empty}><MaterialCommunityIcons name="trending-up" size={64} color={c.textMuted} /><Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Trading</Text></View>} />

      <ModalForm visible={modal} title="Tambah Trading" onClose={() => setModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}><Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} /><Button title="Simpan" style={{ flex: 1 }} onPress={add} /></View>}>
        <Input label="Pair" value={pair} onChangeText={setPair} placeholder="EUR/USD, BTC/USD" error={error} />
        <Input label="Volume" keyboardType="numeric" value={volume} onChangeText={setVolume} placeholder="0.01" />
        <Input label="Harga Entry" icon="currency-usd" keyboardType="numeric" value={entry} onChangeText={setEntry} placeholder="0" />
        <Input label="Stop Loss (opsional)" keyboardType="numeric" value={sl} onChangeText={setSl} placeholder="0" />
        <Input label="Take Profit (opsional)" keyboardType="numeric" value={tp} onChangeText={setTp} placeholder="0" />
        <Input label="Alasan Entry" value={reason} onChangeText={setReason} placeholder="Alasan..." />
        <Input label="Hasil P/L (0 jika open)" icon="currency-usd" keyboardType="numeric" value={result} onChangeText={setResult} placeholder="0" />
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
  sumRow: { flexDirection: 'row', padding: Spacing.lg, margin: Spacing.lg, borderRadius: BorderRadius.lg },
  sumItem: { flex: 1, alignItems: 'center' },
  sumLabel: { ...Typography.caption, marginBottom: Spacing.xs }, sumVal: { ...Typography.h4 },
  div: { width: 1, marginHorizontal: Spacing.md },
  list: { padding: Spacing.lg },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  pair: { ...Typography.bodyBold }, date: { ...Typography.caption, marginTop: 2 },
  pl: { ...Typography.h4 },
  detailRow: { marginBottom: Spacing.xs },
  detail: { ...Typography.caption },
  delBtn: { alignSelf: 'flex-end' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg },
});
