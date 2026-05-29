import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import db from '../database';
import { useColors } from '../hooks/useColors';
import { Spacing, BorderRadius, Typography } from '../constants/theme';
import Button from '../components/Button';
import ModalForm from '../components/ModalForm';

interface Category {
  id: number; name: string; type: string; icon: string; color: string;
}

const colorOptions = ['#6366F1','#818CF8','#10B981','#34D399','#F59E0B','#FBBF24','#EF4444','#F87171','#3B82F6','#60A5FA','#EC4899','#F472B6','#8B5CF6','#A78BFA','#14B8A6','#2DD4BF','#F97316','#FB923C','#6B7280','#9CA3AF'];

export default function CategoriesScreen() {
  const { colors } = useColors();
  const c = colors;
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadCategories = () => {
    setCategories(db.getAllSync('SELECT * FROM categories WHERE type = ? ORDER BY name', [tab]) as Category[]);
  };

  useEffect(() => { loadCategories(); }, [tab]);

  const saveCategory = () => {
    setError('');
    if (!name.trim()) { setError('Nama kategori wajib diisi'); return; }
    if (editingId) {
      db.runSync('UPDATE categories SET name = ?, color = ? WHERE id = ?', [name, color, editingId]);
    } else {
      db.runSync('INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
        [name, tab, 'folder', color]);
    }
    setModalVisible(false);
    resetForm();
    loadCategories();
  };

  const deleteCategory = (id: number, name: string) => {
    const txs = db.getAllSync('SELECT count(*) as c FROM transactions WHERE category_id = ?', [id]) as any[];
    if (txs[0]?.c > 0) {
      setError(`Kategori "${name}" memiliki ${txs[0].c} transaksi. Hapus transaksi terlebih dahulu.`);
      return;
    }
    db.runSync('DELETE FROM categories WHERE id = ?', [id]);
    loadCategories();
  };

  const editCategory = (cat: Category) => {
    setName(cat.name);
    setColor(cat.color);
    setEditingId(cat.id);
    setModalVisible(true);
  };

  const resetForm = () => { setName(''); setColor(colorOptions[0]); setEditingId(null); setError(''); };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Kelola Kategori</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setEditingId(null); resetForm(); setModalVisible(true); }}>
          <MaterialCommunityIcons name="plus" size={24} color={c.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabRow, { backgroundColor: c.surface }]}>
        {(['expense', 'income'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && { backgroundColor: c.primaryBg }]}
            onPress={() => setTab(t)}>
            <MaterialCommunityIcons name={t === 'expense' ? 'arrow-down' : 'arrow-up'} size={18}
              color={tab === t ? c.primary : c.textMuted} />
            <Text style={[styles.tabText, { color: tab === t ? c.primary : c.textMuted }]}>
              {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <View style={[styles.errorBar, { backgroundColor: c.errorBg, borderLeftColor: c.error }]}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={c.error} />
          <Text style={[styles.errorText, { color: c.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}><MaterialCommunityIcons name="close" size={16} color={c.error} /></TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={categories}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.cardBody}>
              <View style={[styles.cardIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name="folder" size={20} color={item.color} />
              </View>
              <Text style={[styles.cardName, { color: c.text }]}>{item.name}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => editCategory(item)} style={styles.actionBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={c.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCategory(item.id, item.name)} style={styles.actionBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={c.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="shape-outline" size={64} color={c.textMuted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Belum Ada Kategori</Text>
            <Text style={[styles.emptyDesc, { color: c.textMuted }]}>Tap + untuk menambah kategori {tab === 'expense' ? 'pengeluaran' : 'pemasukan'}</Text>
          </View>
        }
      />

      <ModalForm visible={modalVisible} title={editingId ? 'Edit Kategori' : 'Tambah Kategori'}
        onClose={() => setModalVisible(false)}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
            <Button title="Simpan" style={{ flex: 1 }} onPress={saveCategory} />
          </View>
        }>
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <Text style={[styles.formLabel, { color: c.textSecondary }]}>Nama Kategori</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, borderColor: c.surfaceBorder, color: c.text }]}
            placeholder="Contoh: Makanan"
            placeholderTextColor={c.textMuted}
            value={name}
            onChangeText={setName}
          />
          {error && !name.trim() ? <Text style={[styles.formError, { color: c.error }]}>{error}</Text> : null}

          <Text style={[styles.formLabel, { color: c.textSecondary, marginTop: Spacing.lg }]}>Warna</Text>
          <View style={styles.colorGrid}>
            {colorOptions.map(clr => (
              <TouchableOpacity key={clr} style={[styles.colorBtn, { backgroundColor: clr }, color === clr && styles.colorActive]}
                onPress={() => setColor(clr)}>
                {color === clr && <MaterialCommunityIcons name="check" size={16} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ModalForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1,
  },
  backBtn: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3, flex: 1 },
  tabRow: {
    flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, minHeight: 48,
  },
  tabText: { ...Typography.smallBold },
  errorBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, margin: Spacing.lg, borderRadius: BorderRadius.sm, borderLeftWidth: 3,
  },
  errorText: { flex: 1, ...Typography.caption },
  list: { padding: Spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md, overflow: 'hidden',
  },
  colorDot: { width: 4, height: 'auto' },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  cardIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  cardName: { ...Typography.smallBold },
  cardActions: { flexDirection: 'row', paddingRight: Spacing.sm },
  actionBtn: { padding: Spacing.sm, minWidth: 36, minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center' },
  formLabel: { ...Typography.smallBold, marginBottom: Spacing.sm },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: 16, minHeight: 52 },
  formError: { ...Typography.caption, marginTop: Spacing.xs },
  colorGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm,
  },
  colorBtn: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  colorActive: { borderWidth: 3, borderColor: 'white' },
});
