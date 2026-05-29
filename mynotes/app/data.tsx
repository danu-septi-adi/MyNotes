import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import db from '../database';
import { useColors } from '../hooks/useColors';
import { useCurrency } from '../hooks/useCurrency';
import { Spacing, BorderRadius, Typography } from '../constants/theme';
import Button from '../components/Button';

export default function DataScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency(); const c = colors;
  const [loading, setLoading] = useState('');

  const exportJSON = async () => {
    setLoading('json');
    const tables = ['transactions', 'categories', 'budgets', 'debts', 'todos', 'journals', 'wishlists', 'tradings', 'investings'];
    const data: Record<string, any> = {};
    for (const t of tables) {
      data[t] = db.getAllSync(`SELECT * FROM ${t}`);
    }
    const json = JSON.stringify(data, null, 2);
    const path = `${FileSystem.documentDirectory}mynotes_export_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(path, json);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'application/json' });
    } else {
      Alert.alert('Tersimpan', `File: ${path}`);
    }
    setLoading('');
  };

  const exportCSV = async () => {
    setLoading('csv');
    const tables = ['transactions', 'categories', 'budgets', 'debts', 'todos', 'journals', 'wishlists', 'tradings', 'investings'];
    let csv = '';
    for (const t of tables) {
      const rows = db.getAllSync(`SELECT * FROM ${t}`) as any[];
      if (rows.length === 0) continue;
      csv += `\n=== ${t} ===\n`;
      csv += Object.keys(rows[0]).join(',') + '\n';
      for (const r of rows) {
        csv += Object.values(r).map(v => `"${v}"`).join(',') + '\n';
      }
    }
    const path = `${FileSystem.documentDirectory}mynotes_export_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, csv);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/csv' });
    } else {
      Alert.alert('Tersimpan', `File: ${path}`);
    }
    setLoading('');
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/csv'] });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);

      if (uri.endsWith('.json')) {
        const data = JSON.parse(content);
        for (const [table, rows] of Object.entries(data)) {
          if (!Array.isArray(rows) || rows.length === 0) continue;
          db.runSync(`DELETE FROM ${table}`);
          for (const row of rows as any[]) {
            const keys = Object.keys(row).filter(k => k !== 'id');
            const vals = keys.map(k => row[k]);
            db.runSync(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, vals);
          }
        }
        Alert.alert('Sukses', 'Data berhasil diimport');
      } else {
        Alert.alert('Info', 'Import CSV belum support. Gunakan format JSON.');
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal import data. Pastikan format file benar.');
    }
  };

  const resetData = () => {
    Alert.alert(
      'Reset Semua Data',
      'Semua data transaksi, todo, wishlist, trading, investing akan dihapus permanen. Yakin?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua', style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Konfirmasi Terakhir',
              'Apakah kamu yakin benar? Data TIDAK BISA dikembalikan!',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Ya, Reset!', style: 'destructive',
                  onPress: () => {
                    const tables = ['transactions', 'budgets', 'debts', 'todos', 'journals', 'wishlists', 'tradings', 'investings'];
                    for (const t of tables) db.runSync(`DELETE FROM ${t}`);
                    Alert.alert('Sukses', 'Semua data berhasil direset.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={{ ...Typography.h3, color: c.text, flex: 1 }}>Data</Text>
      </View>

      <View style={{ padding: Spacing.lg, gap: Spacing.lg }}>
        <View style={{ borderRadius: BorderRadius.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
          <Text style={{ ...Typography.smallBold, color: c.textSecondary, padding: Spacing.lg, paddingBottom: 0 }}>Export Data</Text>
          <TouchableOpacity style={[s.item, { borderBottomColor: c.surfaceBorder }]} onPress={exportJSON} disabled={!!loading}>
            <View style={[s.icon, { backgroundColor: c.primaryBg }]}>
              <MaterialCommunityIcons name="code-json" size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...Typography.smallBold, color: c.text }}>Export JSON</Text>
              <Text style={{ ...Typography.caption, color: c.textMuted }}>Semua tabel dalam 1 file JSON</Text>
            </View>
            {loading === 'json' ? <MaterialCommunityIcons name="loading" size={20} color={c.primary} /> : <MaterialCommunityIcons name="download" size={20} color={c.textMuted} />}
          </TouchableOpacity>

          <TouchableOpacity style={[s.item, { borderBottomColor: c.surfaceBorder }]} onPress={exportCSV} disabled={!!loading}>
            <View style={[s.icon, { backgroundColor: c.successBg }]}>
              <MaterialCommunityIcons name="file-delimited" size={22} color={c.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...Typography.smallBold, color: c.text }}>Export CSV</Text>
              <Text style={{ ...Typography.caption, color: c.textMuted }}>Spreadsheet format</Text>
            </View>
            {loading === 'csv' ? <MaterialCommunityIcons name="loading" size={20} color={c.success} /> : <MaterialCommunityIcons name="download" size={20} color={c.textMuted} />}
          </TouchableOpacity>
        </View>

        <View style={{ borderRadius: BorderRadius.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
          <Text style={{ ...Typography.smallBold, color: c.textSecondary, padding: Spacing.lg, paddingBottom: 0 }}>Import Data</Text>
          <TouchableOpacity style={s.item} onPress={importData}>
            <View style={[s.icon, { backgroundColor: c.warningBg }]}>
              <MaterialCommunityIcons name="file-import-outline" size={22} color={c.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...Typography.smallBold, color: c.text }}>Import dari File</Text>
              <Text style={{ ...Typography.caption, color: c.textMuted }}>JSON format (CSV coming soon)</Text>
            </View>
            <MaterialCommunityIcons name="upload" size={20} color={c.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ borderRadius: BorderRadius.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
          <Text style={{ ...Typography.smallBold, color: c.error, padding: Spacing.lg, paddingBottom: 0 }}>Zona Berbahaya</Text>
          <TouchableOpacity style={s.item} onPress={resetData}>
            <View style={[s.icon, { backgroundColor: c.errorBg }]}>
              <MaterialCommunityIcons name="delete-forever" size={22} color={c.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...Typography.smallBold, color: c.error }}>Reset Semua Data</Text>
              <Text style={{ ...Typography.caption, color: c.textMuted }}>Hapus permanen semua data (double konfirmasi)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={c.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md, minHeight: 56, borderBottomWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
});
