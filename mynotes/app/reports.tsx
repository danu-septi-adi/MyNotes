import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import db from '../database';
import { useColors } from '../hooks/useColors';
import { useCurrency } from '../hooks/useCurrency';
import { Spacing, BorderRadius, Typography } from '../constants/theme';

type PeriodType = 'week' | 'month' | 'custom';

const allMonths = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

export default function ReportsScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency(); const c = colors;
  const sw = Dimensions.get('window').width - 48 < 280 ? 280 : Dimensions.get('window').width - 48;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [customStart, setCustomStart] = useState(now.toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(now.toISOString().split('T')[0]);

  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [dailyIncome, setDailyIncome] = useState<number[]>([]);
  const [dailyExpense, setDailyExpense] = useState<number[]>([]);
  const [catData, setCatData] = useState<{ name: string; amount: number; color: string; pct: number }[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, count: 0 });

  const getDateRange = useCallback(() => {
    let start: string, end: string;
    if (periodType === 'month') {
      const d = new Date(selectedYear, selectedMonth - 1, 1);
      start = d.toISOString().split('T')[0];
      const last = new Date(selectedYear, selectedMonth, 0).getDate();
      end = `${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${last}`;
    } else if (periodType === 'week') {
      const first = new Date(selectedYear, selectedMonth - 1, 1);
      const day1 = first.getDay() || 7;
      const weekStart = 1 + (selectedWeek - 1) * 7 - (day1 - 1);
      const startD = new Date(selectedYear, selectedMonth - 1, weekStart);
      start = startD.toISOString().split('T')[0];
      const endD = new Date(selectedYear, selectedMonth - 1, weekStart + 6);
      end = endD.toISOString().split('T')[0];
    } else {
      start = customStart; end = customEnd;
    }
    return { start, end };
  }, [periodType, selectedMonth, selectedYear, selectedWeek, customStart, customEnd]);

  const loadData = useCallback(() => {
    const { start, end } = getDateRange();

    const rows = db.getAllSync("SELECT date, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as inc, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp, COUNT(*) as cnt FROM transactions WHERE date >= ? AND date <= ? GROUP BY date ORDER BY date", [start, end]) as any[];
    const totals = db.getAllSync("SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as inc, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as exp, COUNT(*) as cnt FROM transactions WHERE date >= ? AND date <= ?", [start, end]) as any[];

    setDailyLabels(rows.map((r: any) => r.date.slice(5)));
    setDailyIncome(rows.map((r: any) => r.inc));
    setDailyExpense(rows.map((r: any) => r.exp));
    setSummary({ income: totals[0]?.inc || 0, expense: totals[0]?.exp || 0, count: totals[0]?.cnt || 0 });

    const cats = db.getAllSync("SELECT c.name, c.color, SUM(t.amount) as total FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.type='expense' AND t.date >= ? AND t.date <= ? GROUP BY t.category_id ORDER BY total DESC LIMIT 5", [start, end]) as any[];
    const total = cats.reduce((s: number, d: any) => s + d.total, 0);
    setCatData(cats.map((d: any) => ({
      name: d.name || 'Lainnya', amount: d.total,
      color: d.color || '#9CA3AF',
      pct: total > 0 ? Math.round((d.total / total) * 100) : 0,
    })));
  }, [getDateRange]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const weeksInMonth = () => {
    const days = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDow = new Date(selectedYear, selectedMonth - 1, 1).getDay() || 7;
    return Math.ceil((days + firstDow - 1) / 7);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.lg, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: Spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={{ ...Typography.h3, color: c.text, flex: 1 }}>Laporan</Text>
      </View>

      {/* Period Pills */}
      <View style={{ flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm }}>
        {(['week', 'month', 'custom'] as const).map(p => (
          <TouchableOpacity key={p} style={[s.pill, periodType === p && { backgroundColor: c.primary, borderColor: c.primary }]} onPress={() => setPeriodType(p)}>
            <Text style={[s.pillText, { color: periodType === p ? '#fff' : c.text }]}>
              {p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Kustom'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period Selectors */}
      {periodType !== 'custom' ? (
        <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Bulan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allMonths.map((m, i) => (
                <TouchableOpacity key={m} style={[s.miniChip, selectedMonth === i + 1 && { backgroundColor: c.primaryBg }]}
                  onPress={() => setSelectedMonth(i + 1)}>
                  <Text style={[s.miniChipText, { color: selectedMonth === i + 1 ? c.primary : c.textMuted }]}>{m.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ width: 80 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Tahun</Text>
            <TextInput style={{ borderWidth: 1, borderColor: c.gray200, borderRadius: BorderRadius.sm, padding: 8, fontSize: 14, color: c.text, textAlign: 'center' }}
              value={String(selectedYear)} onChangeText={t => setSelectedYear(parseInt(t) || selectedYear)} keyboardType="numeric" />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Dari</Text>
            <TextInput style={{ borderWidth: 1, borderColor: c.gray200, borderRadius: BorderRadius.sm, padding: 8, fontSize: 14, color: c.text }}
              value={customStart} onChangeText={setCustomStart} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Sampai</Text>
            <TextInput style={{ borderWidth: 1, borderColor: c.gray200, borderRadius: BorderRadius.sm, padding: 8, fontSize: 14, color: c.text }}
              value={customEnd} onChangeText={setCustomEnd} />
          </View>
        </View>
      )}

      {periodType === 'week' && (
        <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.xs, marginBottom: Spacing.md, flexWrap: 'wrap' }}>
          {Array.from({ length: weeksInMonth() }, (_, i) => (
            <TouchableOpacity key={i} style={[s.weekChip, selectedWeek === i + 1 && { backgroundColor: c.primaryBg }]}
              onPress={() => setSelectedWeek(i + 1)}>
              <Text style={[s.weekChipText, { color: selectedWeek === i + 1 ? c.primary : c.textMuted }]}>Minggu {i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Summary Cards */}
      <View style={{ flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
        <View style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.successBg }}>
          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Pemasukan</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: c.success }} numberOfLines={1} adjustsFontSizeToFit>{fmt(summary.income, 'IDR')}</Text>
        </View>
        <View style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.errorBg }}>
          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Pengeluaran</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: c.error }} numberOfLines={1} adjustsFontSizeToFit>{fmt(summary.expense, 'IDR')}</Text>
        </View>
        <View style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.infoBg }}>
          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Transaksi</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: c.info }}>{summary.count}</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
        <Text style={{ ...Typography.smallBold, color: c.text, marginBottom: Spacing.sm }}>Pemasukan vs Pengeluaran</Text>
        <View style={{ borderRadius: BorderRadius.lg, padding: Spacing.lg, backgroundColor: c.surface, alignItems: 'center' }}>
          {dailyLabels.length > 0 ? (
            <BarChart
              data={{
                labels: dailyLabels.length > 7 ? dailyLabels.filter((_, i) => i % Math.ceil(dailyLabels.length / 7) === 0) : dailyLabels,
                datasets: [
                  { data: dailyExpense.length > 0 ? dailyExpense : [0], color: () => c.error },
                  { data: dailyIncome.length > 0 ? dailyIncome : [0], color: () => c.success },
                ],
              }}
              width={sw} height={200}
              yAxisLabel="" yAxisSuffix=""
              chartConfig={{
                backgroundColor: c.surface, backgroundGradientFrom: c.surface, backgroundGradientTo: c.surface,
                decimalCount: 0, color: () => c.text, labelColor: () => c.textMuted,
                propsForBackgroundLines: { stroke: c.surfaceBorder }, barPercentage: 0.5,
                propsForLabels: { fontSize: 10 },
              }}
              withCustomBarColorFromData
              fromZero
              segments={4}
            />
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <MaterialCommunityIcons name="chart-bar" size={48} color={c.textMuted} />
              <Text style={{ fontSize: 14, color: c.textMuted, marginTop: Spacing.sm }}>Belum ada data transaksi</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pie Chart */}
      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xxxl }}>
        <Text style={{ ...Typography.smallBold, color: c.text, marginBottom: Spacing.sm }}>Pengeluaran per Kategori</Text>
        <View style={{ borderRadius: BorderRadius.lg, padding: Spacing.lg, backgroundColor: c.surface }}>
          {catData.length > 0 ? (
            <>
              <PieChart
                data={catData.map(d => ({ name: d.name, population: d.amount, color: d.color, legendFontColor: c.text, legendFontSize: 12 }))}
                width={sw} height={180}
                chartConfig={{ color: () => c.text }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
              <View style={{ marginTop: Spacing.md, gap: 6 }}>
                {catData.map(d => (
                  <View key={d.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                      <Text style={{ fontSize: 13, color: c.text }}>{d.name}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }} numberOfLines={1} adjustsFontSizeToFit>{fmt(d.amount, 'IDR')} ({d.pct}%)</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <MaterialCommunityIcons name="chart-pie" size={48} color={c.textMuted} />
              <Text style={{ fontSize: 14, color: c.textMuted, marginTop: Spacing.sm }}>Belum ada data pengeluaran</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pill: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  pillText: { fontSize: 14, fontWeight: '600' },
  miniChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.sm, marginRight: 4, minHeight: 36, justifyContent: 'center' },
  miniChipText: { fontSize: 13, fontWeight: '600' },
  weekChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.sm, marginBottom: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  weekChipText: { fontSize: 12, fontWeight: '600' },
});
