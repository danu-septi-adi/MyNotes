import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { Spacing, BorderRadius, Typography } from '../../constants/theme';

const sections = [
  {
    title: 'Keuangan',
    items: [
      { icon: 'shape-outline', label: 'Kelola Kategori', route: '/categories' as const, color: '#6366F1' },
      { icon: 'chart-pie', label: 'Laporan & Grafik', route: '/reports' as const, color: '#3B82F6' },
      { icon: 'calculator-variant', label: 'Budget Management', route: '/budget' as const, color: '#F59E0B' },
      { icon: 'handshake', label: 'Hutang/Piutang', route: '/debts' as const, color: '#10B981' },
    ],
  },
  {
    title: 'Investasi',
    items: [
      { icon: 'trending-up', label: 'Jurnal Trading', route: '/trading' as const, color: '#10B981' },
      { icon: 'chart-line', label: 'Jurnal Investing', route: '/investing' as const, color: '#3B82F6' },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      { icon: 'file-export-outline', label: 'Export/Import Data', route: '/data', color: '#6B7280' },
      { icon: 'file-import-outline', label: 'Import Data', route: null, color: '#6B7280' },
      { icon: 'cog-outline', label: 'Pengaturan', route: '/settings' as const, color: '#6B7280' },
    ],
  },
];

export default function ProfileScreen() {
  const { colors } = useColors();
  const c = colors;

  return (
    <ScrollView style={[st.c, { backgroundColor: c.bg }]}>
      <View style={[st.header, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
        <View style={st.avatarRow}>
          <View style={[st.avatar, { backgroundColor: c.primaryBg }]}>
            <MaterialCommunityIcons name="account" size={40} color={c.primary} />
          </View>
          <View>
            <Text style={[st.name, { color: c.text }]}>MyNotes</Text>
            <Text style={[st.version, { color: c.textMuted }]}>v1.0.0</Text>
          </View>
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={st.section}>
          <Text style={[st.sectionTitle, { color: c.textSecondary }]}>{section.title}</Text>
          <View style={[st.card, { backgroundColor: c.surface }]}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[st.menuItem, i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }]}
                onPress={() => item.route && router.push(item.route)}
                disabled={!item.route}>
                <View style={[st.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[st.menuLabel, { color: item.route ? c.text : c.textMuted }]}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={c.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, paddingTop: 56, borderBottomWidth: 1 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  name: { ...Typography.h3 }, version: { ...Typography.caption, marginTop: 2 },
  section: { marginTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  sectionTitle: { ...Typography.smallBold, marginBottom: Spacing.sm, paddingHorizontal: Spacing.xs },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md, minHeight: 56 },
  menuIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, ...Typography.smallBold },
});
