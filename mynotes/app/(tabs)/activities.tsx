import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import db from '../../database';
import { useColors } from '../../hooks/useColors';
import { Spacing, BorderRadius, Typography } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ModalForm from '../../components/ModalForm';
import DatePicker from '../../components/DatePicker';

interface Todo { id: number; title: string; description: string; status: string; priority: string; due_date: string; }
interface Journal { id: number; date: string; content: string; mood: string; }

export default function ActivitiesScreen() {
  const { colors } = useColors(); const c = colors;
  const [tab, setTab] = useState<'todo' | 'journal'>('todo');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [todoModal, setTodoModal] = useState(false);
  const [journalModal, setJournalModal] = useState(false);
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [jContent, setJContent] = useState(''); const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | ''>('');
  const [jDate, setJDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    if (tab === 'todo') setTodos(db.getAllSync(`SELECT * FROM todos ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'completed' THEN 3 ELSE 4 END, CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, due_date ASC LIMIT 50`) as Todo[]);
    else setJournals(db.getAllSync('SELECT * FROM journals ORDER BY date DESC LIMIT 30') as Journal[]);
  }, [tab]);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const addTodo = () => { setError(''); if (!title.trim()) { setError('Judul wajib diisi'); return; } db.runSync('INSERT INTO todos (title, description, status, priority, due_date) VALUES (?,?,?,?,?)', [title, desc, 'pending', priority, dueDate]); setTodoModal(false); setTitle(''); setDesc(''); setPriority('medium'); setError(''); loadData(); };
  const updateStatus = (id: number, s: string) => { const map: Record<string, string> = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' }; db.runSync('UPDATE todos SET status=? WHERE id=?', [map[s]||'pending', id]); loadData(); };
  const delTodo = (id: number) => { db.runSync('DELETE FROM todos WHERE id=?', [id]); loadData(); };
  const addJournal = () => { setError(''); if (!jContent.trim()) { setError('Konten wajib diisi'); return; } db.runSync('INSERT INTO journals (date,content,mood) VALUES (?,?,?)', [jDate, jContent, mood||null]); setJournalModal(false); setJContent(''); setMood(''); setError(''); loadData(); };
  const delJournal = (id: number) => { db.runSync('DELETE FROM journals WHERE id=?', [id]); loadData(); };

  const pColor = (p: string) => p === 'high' ? c.error : p === 'medium' ? c.warning : c.success;
  const sIcon = (s: string) => s === 'completed' ? 'check-circle' : s === 'in_progress' ? 'progress-check' : 'circle-outline';
  const sColor = (s: string) => s === 'completed' ? c.success : s === 'in_progress' ? c.info : c.warning;
  const moodIcon = (m: string) => m === 'happy' ? 'emoticon-happy' : m === 'neutral' ? 'emoticon-neutral' : 'emoticon-sad';
  const moodColor = (m: string) => m === 'happy' ? c.success : m === 'neutral' ? c.warning : c.error;

  return (
    <View style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <View><Text style={[st.title, { color: c.text }]}>Aktifitas</Text><Text style={[st.sub, { color: c.textMuted }]}>{tab === 'todo' ? `${todos.length} todo` : `${journals.length} jurnal`}</Text></View>
        <TouchableOpacity style={[st.fab, { backgroundColor: c.primary }]} onPress={() => tab === 'todo' ? setTodoModal(true) : setJournalModal(true)}><MaterialCommunityIcons name="plus" size={28} color="#fff" /></TouchableOpacity>
      </View>

      <View style={[st.tabRow, { backgroundColor: c.surface }]}>
        {(['todo', 'journal'] as const).map(t => (
          <TouchableOpacity key={t} style={[st.tab, tab === t && { backgroundColor: c.primaryBg }]} onPress={() => setTab(t)}>
            <MaterialCommunityIcons name={t === 'todo' ? 'checkbox-marked-circle-outline' : 'book-open-variant'} size={20} color={tab === t ? c.primary : c.textMuted} />
            <Text style={[st.tabText, { color: tab === t ? c.primary : c.textMuted }, tab === t && { fontWeight: '600' }]}>{t === 'todo' ? 'Todo List' : 'Journal'}</Text>
            <View style={[st.tabBadge, { backgroundColor: c.primary }]}><Text style={st.tabBadgeText}>{t === 'todo' ? todos.length : journals.length}</Text></View>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'todo' ? (
        <FlatList data={todos} keyExtractor={i => i.id.toString()} contentContainerStyle={st.list}
          renderItem={({ item }) => (
            <View style={[st.todoCard, { backgroundColor: c.surface }]}>
              <View style={[st.pBar, { backgroundColor: pColor(item.priority) }]} />
              <View style={st.todoBody}>
                <View style={st.todoTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.todoTitle, { color: c.text }, item.status === 'completed' && { textDecorationLine: 'line-through', color: c.textMuted }]}>{item.title}</Text>
                    {item.description ? <Text style={[st.todoDesc, { color: c.textMuted }]}>{item.description}</Text> : null}
                  </View>
                  <View style={st.todoActions}>
                    <TouchableOpacity onPress={() => updateStatus(item.id, item.status)} style={st.iconBtn}><MaterialCommunityIcons name={sIcon(item.status)} size={26} color={sColor(item.status)} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => delTodo(item.id)} style={st.iconBtn}><MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} /></TouchableOpacity>
                  </View>
                </View>
                <View style={st.todoBottom}>
                  <View style={st.todoMeta}><MaterialCommunityIcons name="calendar-outline" size={14} color={c.textMuted} /><Text style={[st.metaText, { color: c.textMuted }]}>{new Date(item.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text></View>
                  <View style={[st.badge, { backgroundColor: pColor(item.priority) + '20' }]}><Text style={[st.badgeText, { color: pColor(item.priority) }]}>{item.priority === 'high' ? 'Tinggi' : item.priority === 'medium' ? 'Sedang' : 'Rendah'}</Text></View>
                </View>
              </View>
            </View>)}
          ListEmptyComponent={<View style={st.empty}><MaterialCommunityIcons name="clipboard-check-outline" size={72} color={c.textMuted} /><Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Todo</Text><Text style={[st.emptyDesc, { color: c.textMuted }]}>Tap + untuk menambah todo</Text></View>} />
      ) : (
        <FlatList data={journals} keyExtractor={i => i.id.toString()} contentContainerStyle={st.list}
          renderItem={({ item }) => (
            <View style={[st.jCard, { backgroundColor: c.surface }]}>
              <View style={st.jHead}>
                <View style={st.jDate}><MaterialCommunityIcons name="calendar" size={16} color={c.primary} /><Text style={[st.jDateText, { color: c.primary }]}>{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
                <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                  {item.mood ? <MaterialCommunityIcons name={moodIcon(item.mood)} size={24} color={moodColor(item.mood)} /> : null}
                  <TouchableOpacity onPress={() => delJournal(item.id)} style={st.iconBtn}><MaterialCommunityIcons name="trash-can-outline" size={18} color={c.textMuted} /></TouchableOpacity>
                </View>
              </View>
              <Text style={[st.jContent, { color: c.text }]}>{item.content}</Text>
            </View>)}
          ListEmptyComponent={<View style={st.empty}><MaterialCommunityIcons name="book-open-page-variant-outline" size={72} color={c.textMuted} /><Text style={[st.emptyTitle, { color: c.text }]}>Belum Ada Jurnal</Text><Text style={[st.emptyDesc, { color: c.textMuted }]}>Tap + untuk menulis jurnal</Text></View>} />
      )}

      <ModalForm visible={todoModal} title="Tambah Todo" onClose={() => setTodoModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}><Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setTodoModal(false)} /><Button title="Simpan" style={{ flex: 1 }} onPress={addTodo} /></View>}>
        <Input label="Judul" value={title} onChangeText={setTitle} placeholder="Beli bahan makanan..." error={error} />
        <Input label="Deskripsi" value={desc} onChangeText={setDesc} placeholder="Detail tambahan..." multiline numberOfLines={3} />
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
          <Text style={[st.label, { color: c.textSecondary }]}>Prioritas</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
            {(['high', 'medium', 'low'] as const).map(p => (
              <TouchableOpacity key={p} style={[st.pBtn, priority === p && { backgroundColor: c.bg }, { borderColor: pColor(p) }]} onPress={() => setPriority(p)}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: pColor(p) }} />
                <Text style={[st.pBtnText, { color: priority === p ? pColor(p) : c.textMuted }]}>{p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Rendah'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <DatePicker label="Tanggal Jatuh Tempo" value={dueDate} onChange={setDueDate} />
      </ModalForm>

      <ModalForm visible={journalModal} title="Tulis Jurnal" onClose={() => setJournalModal(false)}
        footer={<View style={{ flexDirection: 'row', gap: Spacing.md }}><Button title="Batal" variant="secondary" style={{ flex: 1 }} onPress={() => setJournalModal(false)} /><Button title="Simpan" style={{ flex: 1 }} onPress={addJournal} /></View>}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <Text style={[st.label, { color: c.textSecondary }]}>Bagaimana harimu?</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.sm }}>
            {(['happy', 'neutral', 'sad'] as const).map(m => (
              <TouchableOpacity key={m} style={[st.moodBtn, mood === m && { borderColor: c.primary, backgroundColor: c.surface }]} onPress={() => setMood(m)}>
                <MaterialCommunityIcons name={moodIcon(m)} size={36} color={mood === m ? moodColor(m) : c.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Input label="Ceritakan harimu" value={jContent} onChangeText={setJContent} placeholder="Hari ini aku..." multiline numberOfLines={6} error={error} />
        <DatePicker label="Tanggal" value={jDate} onChange={setJDate} />
      </ModalForm>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  title: { ...Typography.h2 }, sub: { ...Typography.caption, marginTop: Spacing.xs },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  tabRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, minHeight: 48 },
  tabText: { ...Typography.small },
  tabBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2, minWidth: 22, alignItems: 'center' },
  tabBadgeText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  list: { padding: Spacing.lg },
  todoCard: { flexDirection: 'row', borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden' },
  pBar: { width: 4 },
  todoBody: { flex: 1, padding: Spacing.lg },
  todoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  todoTitle: { ...Typography.smallBold, flex: 1 },
  todoDesc: { ...Typography.caption, marginTop: Spacing.xs },
  todoActions: { flexDirection: 'row', gap: Spacing.xs },
  iconBtn: { padding: Spacing.xs, minWidth: 36, minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  todoBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  todoMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Typography.caption },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  badgeText: { ...Typography.caption, fontWeight: '600' },
  jCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  jHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  jDate: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  jDateText: { ...Typography.smallBold },
  jContent: { ...Typography.body, lineHeight: 24 },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptyDesc: { ...Typography.small, textAlign: 'center' },
  label: { ...Typography.smallBold },
  pBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderWidth: 2, borderRadius: BorderRadius.md, minHeight: 48 },
  pBtnText: { ...Typography.caption, fontWeight: '600' },
  moodBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
});
