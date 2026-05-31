import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import db from '../database';
import { useColors } from '../hooks/useColors';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import ModalForm from '../components/ModalForm';

interface Credential {
  id: number; category_id: number; title: string; description: string; fields: string;
}

interface Field { label: string; value: string; }

export default function CredentialsScreen() {
  const { colors } = useColors(); const c = colors;
  const shadow = Shadow(colors);
  const { categoryId, name } = useLocalSearchParams<{ categoryId: string; name: string }>();
  const [items, setItems] = useState<Credential[]>([]);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  const [fields, setFields] = useState<Field[]>([{ label: '', value: '' }]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copyingField, setCopyingField] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    setItems(db.getAllSync('SELECT * FROM credentials WHERE category_id=? ORDER BY title', [Number(categoryId)]) as Credential[]);
  }, [categoryId]);

  useFocusEffect(useCallback(() => { load(); }, []));

  const save = () => {
    setError('');
    if (!title.trim()) { setError('Judul credential wajib diisi'); return; }
    const validFields = fields.filter(f => f.label.trim());
    if (validFields.length === 0) { setError('Minimal 1 field dengan label'); return; }
    setSaveLoading(true);
    try {
      const fieldsJson = JSON.stringify(validFields);
      if (editingId) {
        db.runSync('UPDATE credentials SET title=?, description=?, fields=? WHERE id=?', [title.trim(), desc.trim(), fieldsJson, editingId]);
      } else {
        db.runSync('INSERT INTO credentials (category_id, title, description, fields) VALUES (?,?,?,?)', [Number(categoryId), title.trim(), desc.trim(), fieldsJson]);
      }
      setModal(false); reset(); load();
    } catch {
      setError('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDelete = (item: Credential) => {
    Alert.alert(
      'Hapus Credential',
      `Yakin ingin menghapus "${item.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => { db.runSync('DELETE FROM credentials WHERE id=?', [item.id]); load(); } },
      ]
    );
  };

  const copyValue = async (val: string, credentialId: number, fieldLabel: string) => {
    try {
      await Clipboard.setStringAsync(val);
      setCopiedId(credentialId);
      setCopyingField(fieldLabel);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => { setCopiedId(null); setCopyingField(null); }, 1500);
    } catch { Alert.alert('Gagal', 'Tidak dapat menyalin nilai'); }
  };

  const edit = (item: Credential) => {
    setEditingId(item.id); setTitle(item.title); setDesc(item.description || '');
    setFields(JSON.parse(item.fields || '[]'));
    setModal(true);
  };

  const reset = () => { setEditingId(null); setTitle(''); setDesc(''); setFields([{ label: '', value: '' }]); setError(''); };

  const addField = () => setFields([...fields, { label: '', value: '' }]);
  const removeField = (i: number) => { if (fields.length > 1) setFields(fields.filter((_, idx) => idx !== i)); };
  const updateField = (i: number, key: 'label' | 'value', val: string) => {
    const f = [...fields]; f[i][key] = val; setFields(f);
  };

  const toggleHidden = (id: number) => {
    setHidden(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isShowing = (id: number): boolean => {
    if (hidden[id] === undefined) return false; // default hidden
    return hidden[id];
  };

  return (
    <View style={[s.c, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back} accessibilityLabel="Kembali">
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: c.text }]} numberOfLines={1}>{decodeURIComponent(name || 'Credential')}</Text>
        <TouchableOpacity onPress={() => { reset(); setModal(true); }} style={s.addBtn} accessibilityLabel="Tambah credential">
          <MaterialCommunityIcons name="plus" size={24} color={c.primary} />
        </TouchableOpacity>
      </View>

      {/* Info bar */}
      {items.length > 0 && (
        <View style={[s.infoBar, { backgroundColor: c.primaryBg }]}>
          <MaterialCommunityIcons name="shield-check" size={14} color={c.primary} />
          <Text style={[s.infoText, { color: c.primary }]}>
            {items.length} credential tersimpan — tap field untuk salin
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList data={items} keyExtractor={i => i.id.toString()} contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const parsed: Field[] = JSON.parse(item.fields || '[]');
          const show = isShowing(item.id);
          return (
            <View style={[s.card, { backgroundColor: c.surface }, shadow.md]}>
              {/* Title + Actions */}
              <View style={s.cardHeader}>
                <View style={[s.cardIcon, { backgroundColor: c.primaryBg }]}>
                  <MaterialCommunityIcons name="shield-lock" size={20} color={c.primary} />
                </View>
                <View style={s.cardTitleArea}>
                  <Text style={[s.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</Text>
                  {item.description ? (
                    <Text style={[s.cardDesc, { color: c.textMuted }]} numberOfLines={1}>{item.description}</Text>
                  ) : null}
                </View>
                <View style={s.cardActions}>
                  <TouchableOpacity
                    onPress={() => toggleHidden(item.id)}
                    style={s.iconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={show ? 'Sembunyikan' : 'Tampilkan'}
                    accessibilityRole="button">
                    <MaterialCommunityIcons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => edit(item)}
                    style={s.iconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Edit"
                    accessibilityRole="button">
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={c.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    style={s.iconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Hapus"
                    accessibilityRole="button">
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={c.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Fields */}
              {parsed.length > 0 && (
                <View style={[s.fieldsBox, { backgroundColor: c.bg, borderWidth: 1, borderColor: c.surfaceBorder }]}>
                  {parsed.map((f, i) => {
                    const isCopied = copiedId === item.id && copyingField === f.label;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          s.fieldRow,
                          i < parsed.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }
                        ]}
                        onPress={() => show ? copyValue(f.value, item.id, f.label) : null}
                        activeOpacity={show ? 0.6 : 1}
                        disabled={!show}
                        accessibilityLabel={show ? `${f.label}: ${f.value ? 'Tap untuk salin' : 'kosong'}` : `${f.label}: tersembunyi`}
                        accessibilityRole="button">
                        <View style={s.fieldLeft}>
                          <MaterialCommunityIcons name="form-textbox" size={12} color={c.textMuted} style={{ marginRight: 6 }} />
                          <Text style={[s.fieldLabel, { color: c.textMuted }]} numberOfLines={1}>{f.label}</Text>
                        </View>
                        <View style={s.fieldRight}>
                          <Text
                            style={[s.fieldValue, { color: show ? c.text : c.textMuted }]}
                            numberOfLines={1}
                            selectable={show}>
                            {show ? f.value : '•'.repeat(Math.min(f.value.length || 8, 20))}
                          </Text>
                          {show && (
                            <View style={s.copyIconWrap}>
                              {isCopied ? (
                                <MaterialCommunityIcons name="check-circle" size={16} color={c.success} />
                              ) : (
                                <MaterialCommunityIcons name="content-copy" size={14} color={c.gray400} />
                              )}
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[s.emptyIconBox, { backgroundColor: c.primaryBg }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={48} color={c.primary} />
            </View>
            <Text style={[s.emptyTitle, { color: c.text }]}>Belum Ada Credential</Text>
            <Text style={[s.emptyDesc, { color: c.textMuted }]}>Tambahkan password, seed phrase, API key, dan data sensitif lainnya dengan aman</Text>
          </View>
        } />

      {/* Modal Form */}
      <ModalForm visible={modal} title={editingId ? 'Edit Credential' : 'Tambah Credential'} onClose={() => setModal(false)}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => { setModal(false); reset(); }} />
            <Button title="Simpan" style={{ flex: 1 }} onPress={save} loading={saveLoading} />
          </View>
        }>
        <Input label="Judul" value={title} onChangeText={setTitle} placeholder="Wallet Utama" error={error} icon="lock-outline" />
        <Input label="Deskripsi (opsional)" value={desc} onChangeText={setDesc} placeholder="Catatan tambahan..." icon="text-short" />

        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="format-list-bulleted" size={16} color={c.textSecondary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.textSecondary }}>Fields</Text>
          </View>
        </View>

        {fields.map((f, i) => (
          <View key={i} style={s.fieldInputRow}>
            <View style={s.fieldLabelInput}>
              <Text style={s.fieldInputBadge}>#{i + 1}</Text>
              <TextInput
                style={[s.fieldTextInput, { borderColor: c.gray200, color: c.text, backgroundColor: c.surface }]}
                placeholder="Label" placeholderTextColor={c.textMuted}
                value={f.label} onChangeText={v => updateField(i, 'label', v)} />
            </View>
            <View style={s.fieldValueInput}>
              <TextInput
                style={[s.fieldTextInput, { flex: 1, borderColor: c.gray200, color: c.text, backgroundColor: c.surface }]}
                placeholder="Value" placeholderTextColor={c.textMuted}
                value={f.value} onChangeText={v => updateField(i, 'value', v)}
                secureTextEntry />
              <TouchableOpacity
                onPress={() => removeField(i)}
                style={s.fieldRemoveBtn}
                accessibilityLabel="Hapus field"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={20} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={addField} style={s.addFieldBtn}>
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color={c.primary} />
          <Text style={{ fontSize: 14, color: c.primary, fontWeight: '600' }}>Tambah Field</Text>
        </TouchableOpacity>
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
  title: { ...Typography.h3, flex: 1, textAlign: 'center' },
  addBtn: { padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg,
  },
  infoText: { fontSize: 12, fontWeight: '500' },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

  // Card
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  cardTitleArea: { flex: 1, marginLeft: Spacing.md },
  cardTitle: { ...Typography.bodyBold },
  cardDesc: { ...Typography.caption, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: Spacing.xs, marginLeft: Spacing.sm },
  iconBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    justifyContent: 'center', alignItems: 'center',
  },

  // Fields
  fieldsBox: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  fieldRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, minHeight: 44,
  },
  fieldLeft: { flexDirection: 'row', alignItems: 'center', flex: 0.45 },
  fieldLabel: { fontSize: 13, fontWeight: '500' },
  fieldRight: { flex: 0.55, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  fieldValue: { fontSize: 14, fontWeight: '600', flexShrink: 1, maxWidth: '85%' },
  copyIconWrap: { marginLeft: 6, width: 20, alignItems: 'center' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: Spacing.xxl },
  emptyIconBox: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  emptyTitle: { ...Typography.h4, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center', lineHeight: 22 },

  // Field inputs in modal
  fieldInputRow: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  fieldLabelInput: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  fieldInputBadge: { fontSize: 11, fontWeight: '700', color: '#6366F1', minWidth: 20 },
  fieldTextInput: {
    borderWidth: 1, borderRadius: BorderRadius.sm,
    paddingHorizontal: 10, paddingVertical: 10,
    fontSize: 14, height: 44, flex: 1,
  },
  fieldValueInput: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fieldRemoveBtn: { minWidth: 36, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  addFieldBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.xl, marginTop: Spacing.sm, marginBottom: Spacing.sm,
  },
});
