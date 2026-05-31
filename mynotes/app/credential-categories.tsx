import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import db from '../database';
import { useColors } from '../hooks/useColors';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import ModalForm from '../components/ModalForm';

interface Cat { id: number; name: string; description: string; }

export default function CredentialCategoriesScreen() {
  const { colors } = useColors(); const c = colors;
  const shadow = Shadow(colors);
  const [cats, setCats] = useState<Cat[]>([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const load = useCallback(() => setCats(db.getAllSync('SELECT * FROM credential_categories ORDER BY name') as Cat[]), []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = () => {
    setError('');
    if (!name.trim()) { setError('Nama kategori wajib diisi'); return; }
    setSaveLoading(true);
    try {
      if (editingId) db.runSync('UPDATE credential_categories SET name=?, description=? WHERE id=?', [name.trim(), desc.trim(), editingId]);
      else db.runSync('INSERT INTO credential_categories (name, description) VALUES (?,?)', [name.trim(), desc.trim()]);
      setModal(false); setName(''); setDesc(''); setEditingId(null); setError(''); load();
    } catch {
      setError('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDelete = (id: number, itemName: string) => {
    const cnt = (db.getAllSync('SELECT count(*) as c FROM credentials WHERE category_id=?', [id]) as any[])[0]?.c || 0;
    if (cnt > 0) {
      Alert.alert(
        'Tidak Dapat Dihapus',
        `Kategori "${itemName}" memiliki ${cnt} credential. Hapus semua credential di kategori ini terlebih dahulu.`,
        [{ text: 'Mengerti', style: 'default' }]
      );
      return;
    }
    Alert.alert(
      'Hapus Kategori',
      `Yakin ingin menghapus kategori "${itemName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => { db.runSync('DELETE FROM credential_categories WHERE id=?', [id]); load(); } },
      ]
    );
  };

  const openEdit = (item: Cat) => {
    setName(item.name); setDesc(item.description || ''); setEditingId(item.id); setModal(true);
  };

  const openAdd = () => {
    setError(''); setName(''); setDesc(''); setEditingId(null); setModal(true);
  };

  return (
    <View style={[s.c, { backgroundColor: c.bg }]}>
      <View style={[s.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back} accessibilityLabel="Kembali">
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: c.text }]}>Credential</Text>
        <TouchableOpacity onPress={openAdd} style={s.addBtn} accessibilityLabel="Tambah kategori">
          <MaterialCommunityIcons name="plus" size={24} color={c.primary} />
        </TouchableOpacity>
      </View>

      <FlatList data={cats} keyExtractor={i => i.id.toString()} contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const cnt = (db.getAllSync('SELECT count(*) as c FROM credentials WHERE category_id=?', [item.id]) as any[])[0]?.c || 0;
          return (
            <TouchableOpacity style={[s.card, { backgroundColor: c.surface }, shadow.md]}
              onPress={() => router.push(`/credentials?categoryId=${item.id}&name=${encodeURIComponent(item.name)}`)}
              activeOpacity={0.7}
              accessibilityLabel={`Buka ${item.name}, ${cnt} item`}
              accessibilityRole="button">
              <View style={[s.cardIcon, { backgroundColor: c.primaryBg }]}>
                <MaterialCommunityIcons name="folder-lock" size={22} color={c.primary} />
              </View>
              <View style={s.cardBody}>
                <Text style={[s.cardTitle, { color: c.text }]} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                  <Text style={[s.cardDesc, { color: c.textMuted }]} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <View style={s.cardMeta}>
                  <View style={[s.badge, { backgroundColor: c.primaryBg }]}>
                    <MaterialCommunityIcons name="lock-outline" size={10} color={c.primary} style={{ marginRight: 4 }} />
                    <Text style={[s.badgeText, { color: c.primary }]}>{cnt} tersimpan</Text>
                  </View>
                </View>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={s.iconBtn} accessibilityLabel={`Edit ${item.name}`}>
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={c.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id, item.name)} style={s.iconBtn} accessibilityLabel={`Hapus ${item.name}`}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={c.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[s.emptyIconBox, { backgroundColor: c.primaryBg }]}>
              <MaterialCommunityIcons name="folder-lock-outline" size={48} color={c.primary} />
            </View>
            <Text style={[s.emptyTitle, { color: c.text }]}>Belum Ada Kategori</Text>
            <Text style={[s.emptyDesc, { color: c.textMuted }]}>Buat kategori untuk menyimpan password, seed phrase, API key, dan data sensitif lainnya</Text>
          </View>
        } />

      <ModalForm visible={modal} title={editingId ? 'Edit Kategori' : 'Tambah Kategori'} onClose={() => setModal(false)}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(false)} />
            <Button title="Simpan" style={{ flex: 1 }} onPress={save} loading={saveLoading} />
          </View>
        }>
        <Input label="Nama Kategori" value={name} onChangeText={setName} placeholder="Crypto Wallet, Bank, Email..." error={error} icon="folder-outline" />
        <Input label="Deskripsi (opsional)" value={desc} onChangeText={setDesc} placeholder="Jelaskan isi kategori ini..." icon="text-short" />
      </ModalForm>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  back: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3 },
  addBtn: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
  },
  cardIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { ...Typography.bodyBold },
  cardDesc: { ...Typography.caption, marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardActions: { gap: Spacing.xs },
  iconBtn: { padding: Spacing.sm, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: BorderRadius.sm },
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: Spacing.xxl },
  emptyIconBox: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  emptyTitle: { ...Typography.h4, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center', lineHeight: 22 },
});
