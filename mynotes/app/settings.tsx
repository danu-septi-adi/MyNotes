import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ColorPicker from 'react-native-wheel-color-picker';
import { useSettings } from '../contexts/SettingsContext';
import { useColors } from '../hooks/useColors';
import { currencies } from '../constants/currencies';
import { Spacing, BorderRadius, Typography } from '../constants/theme';
import { syncRates } from '../services/rates';

export default function SettingsScreen() {
  const { settings, setNativeCurrency, setDisplayCurrency, setTheme, setTabColor } = useSettings();
  const { colors } = useColors(); const c = colors;
  const [colorModal, setColorModal] = useState(false);
  const [tempColor, setTempColor] = useState(settings.tabColor);
  const [syncing, setSyncing] = useState(false);

  const themeOptions = [
    { key: 'light' as const, label: 'Terang', icon: 'white-balance-sunny' as const },
    { key: 'dark' as const, label: 'Gelap', icon: 'moon-waning-crescent' as const },
    { key: 'system' as const, label: 'Ikuti Sistem', icon: 'theme-light-dark' as const },
  ];

  const handleSyncRates = async () => {
    setSyncing(true);
    await syncRates();
    setSyncing(false);
  };

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[st.title, { color: c.text }]}>Pengaturan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={st.content}>
        {/* Warna Tema */}
        <Text style={[st.sectionTitle, { color: c.textSecondary }]}>Warna Aksen</Text>
        <View style={[st.card, { backgroundColor: c.surface }]}>
          <TouchableOpacity style={st.colorRow} onPress={() => { setTempColor(settings.tabColor); setColorModal(true); }}>
            <View style={[st.colorPreview, { backgroundColor: settings.tabColor }]}>
              <MaterialCommunityIcons name="palette" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.rowLabel, { color: c.text }]}>Warna Tema</Text>
              <Text style={[st.rowSub, { color: c.textMuted }]}>{settings.tabColor}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={c.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Native Currency */}
        <Text style={[st.sectionTitle, { color: c.textSecondary }]}>Mata Uang Asli (Native)</Text>
        <Text style={[st.sectionDesc, { color: c.textMuted }]}>Mata uang yang kamu gunakan sehari-hari untuk transaksi</Text>
        <View style={[st.card, { backgroundColor: c.surface }]}>
          {currencies.map((cur, i) => (
            <TouchableOpacity key={cur.code}
              style={[st.row, i < currencies.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }]}
              onPress={() => setNativeCurrency(cur.code)}>
              <View style={st.rowLeft}>
                <View style={[st.flag, { backgroundColor: c.primaryBg }]}>
                  <Text style={[st.flagText, { color: c.primary }]}>{cur.symbol}</Text>
                </View>
                <View>
                  <Text style={[st.rowLabel, { color: c.text }]}>{cur.code} - {cur.name}</Text>
                  <Text style={[st.rowSub, { color: c.textMuted }]}>Contoh: {cur.symbol}1.000</Text>
                </View>
              </View>
              {settings.nativeCurrency === cur.code && <MaterialCommunityIcons name="check-circle" size={22} color={c.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Display Currency */}
        <Text style={[st.sectionTitle, { color: c.textSecondary }]}>Mata Uang Tampilan (Display)</Text>
        <Text style={[st.sectionDesc, { color: c.textMuted }]}>Semua nominal akan dikonversi ke mata uang ini. Jika sama dengan native, tidak ada konversi.</Text>
        <View style={[st.card, { backgroundColor: c.surface }]}>
          {currencies.map((cur, i) => (
            <TouchableOpacity key={cur.code}
              style={[st.row, i < currencies.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }]}
              onPress={() => setDisplayCurrency(cur.code)}>
              <View style={st.rowLeft}>
                <View style={[st.flag, { backgroundColor: c.primaryBg }]}>
                  <Text style={[st.flagText, { color: c.primary }]}>{cur.symbol}</Text>
                </View>
                <View>
                  <Text style={[st.rowLabel, { color: c.text }]}>{cur.code} - {cur.name}</Text>
                  <Text style={[st.rowSub, { color: c.textMuted }]}>Contoh: {cur.symbol}1.000</Text>
                </View>
              </View>
              {settings.displayCurrency === cur.code && <MaterialCommunityIcons name="check-circle" size={22} color={c.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[st.syncBtn, { backgroundColor: c.primaryBg, borderColor: c.primary }]} onPress={handleSyncRates} disabled={syncing}>
          <MaterialCommunityIcons name="refresh" size={18} color={c.primary} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.primary }}>{syncing ? 'Menyinkronkan...' : 'Sync Kurs Mata Uang'}</Text>
        </TouchableOpacity>
        <Text style={[st.sectionDesc, { color: c.textMuted, paddingHorizontal: Spacing.lg }]}>Diperlukan untuk konversi native → display. Otomatis sync tiap 1 jam.</Text>

        {/* Tema */}
        <Text style={[st.sectionTitle, { color: c.textSecondary, marginTop: Spacing.xl }]}>Mode Tampilan</Text>
        <View style={[st.card, { backgroundColor: c.surface }]}>
          {themeOptions.map((opt, i) => (
            <TouchableOpacity key={opt.key}
              style={[st.row, i < themeOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }]}
              onPress={() => setTheme(opt.key)}>
              <View style={st.rowLeft}>
                <MaterialCommunityIcons name={opt.icon} size={24} color={c.text} />
                <Text style={[st.rowLabel, { color: c.text }]}>{opt.label}</Text>
              </View>
              {settings.theme === opt.key && <MaterialCommunityIcons name="check-circle" size={22} color={c.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={colorModal} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <TouchableOpacity style={st.modalBackdrop} activeOpacity={1} onPress={() => setColorModal(false)} />
          <View style={[st.modalContent, { backgroundColor: c.surface }]}>
            <View style={st.modalHeader}>
              <TouchableOpacity onPress={() => setColorModal(false)}><Text style={[st.cancelText, { color: c.textMuted }]}>Batal</Text></TouchableOpacity>
              <Text style={[st.modalTitle, { color: c.text }]}>Pilih Warna</Text>
              <TouchableOpacity onPress={() => { setTabColor(tempColor); setColorModal(false); }}><Text style={[st.saveText, { color: c.primary }]}>Simpan</Text></TouchableOpacity>
            </View>
            <View style={st.pickerContainer}>
              <ColorPicker color={tempColor} onColorChange={setTempColor} thumbSize={40} sliderSize={40} noSnap row={false} swatches={false} />
            </View>
            <View style={st.selectedRow}>
              <View style={[st.livePreview, { backgroundColor: tempColor }]} />
              <Text style={[st.hexText, { color: c.text }]}>{tempColor}</Text>
            </View>
            <View style={st.presetsRow}>
              {['#6366F1','#8B5CF6','#3B82F6','#10B981','#14B8A6','#F59E0B','#F97316','#EF4444','#EC4899','#6B7280'].map(clr => (
                <TouchableOpacity key={clr} style={[st.presetDot, { backgroundColor: clr }, tempColor === clr && { borderWidth: 3, borderColor: '#fff' }]} onPress={() => setTempColor(clr)} />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  backBtn: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  title: { ...Typography.h3 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  sectionTitle: { ...Typography.smallBold, marginBottom: Spacing.xs, marginTop: Spacing.xl, paddingHorizontal: Spacing.xs },
  sectionDesc: { ...Typography.caption, marginBottom: Spacing.sm, paddingHorizontal: Spacing.xs },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md },
  colorRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  colorPreview: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, minHeight: 56 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  rowLabel: { ...Typography.smallBold },
  rowSub: { ...Typography.caption, marginTop: 2 },
  flag: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  flagText: { fontWeight: '700', fontSize: 14 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 2, margin: Spacing.lg, minHeight: 48 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, paddingBottom: Spacing.xxxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { ...Typography.h4 },
  cancelText: { ...Typography.bodyBold }, saveText: { ...Typography.bodyBold },
  pickerContainer: { paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.xl, height: 280 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  livePreview: { width: 32, height: 32, borderRadius: 16 },
  hexText: { ...Typography.smallBold },
  presetsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  presetDot: { width: 36, height: 36, borderRadius: 18 },
});
