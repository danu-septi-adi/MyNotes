import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useCallback, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import db from '../../database';
import { useColors } from '../../hooks/useColors';
import { useCurrency } from '../../hooks/useCurrency';
import { Spacing, BorderRadius, Typography } from '../../constants/theme';

const navItems = [
  { route: '/finance', icon: 'wallet-outline', label: 'Finance', color: '#6366F1' },
  { route: '/activities', icon: 'clipboard-text-outline', label: 'Aktifitas', color: '#10B981' },
  { route: '/wishlist', icon: 'star-outline', label: 'Wishlist', color: '#F59E0B' },
  { route: '/profile', icon: 'account-outline', label: 'Profil', color: '#6B7280' },
] as const;

export default function DashboardScreen() {
  const { colors } = useColors(); const { format: fmt } = useCurrency();
  const insets = useSafeAreaInsets(); const c = colors;

  const [data, setData] = useState({
    balance: 0, income: 0, expense: 0,
    todayExpense: 0, todayIncome: 0,
    todayTodos: 0, pendingTodos: 0,
    budgetCount: 0, budgetTotal: 0, budgetSpent: 0,
    activeDebts: 0, debtTotal: 0,
    totalTrades: 0, tradePL: 0,
    totalInvested: 0,
    wishlistCount: 0, wishlistTotal: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const month = today.slice(0, 7);

    const i = db.getAllSync('SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type="income"') as any[];
    const e = db.getAllSync('SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type="expense"') as any[];
    const te = db.getAllSync('SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type="expense" AND date=?', [today]) as any[];
    const ti = db.getAllSync('SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type="income" AND date=?', [today]) as any[];
    const td = db.getAllSync('SELECT COUNT(*) as c FROM todos WHERE date(due_date)=date(?) AND status!="completed"', [today]) as any[];
    const pd = db.getAllSync("SELECT COUNT(*) as c FROM todos WHERE status!='completed'") as any[];
    const bc = db.getAllSync('SELECT COUNT(*) as c FROM budgets WHERE month=?', [month]) as any[];
    const budgetRows = db.getAllSync('SELECT COALESCE(SUM(amount),0) as t FROM budgets WHERE month=?', [month]) as any[];
    const spentRows = db.getAllSync("SELECT COALESCE(SUM(t.amount),0) as t FROM transactions t JOIN budgets b ON t.category_id=b.category_id WHERE b.month=? AND strftime('%Y-%m',t.date)=?", [month, month]) as any[];
    const ad = db.getAllSync("SELECT COALESCE(SUM(amount),0) as t FROM debts WHERE status='active'") as any[];
    const ac = db.getAllSync("SELECT COUNT(*) as c FROM debts WHERE status='active'") as any[];
    const tp = db.getAllSync('SELECT COALESCE(SUM(result),0) as t, COUNT(*) as c FROM tradings') as any[];
    const inv = db.getAllSync('SELECT COALESCE(SUM(total_invest),0) as t FROM investings') as any[];
    const wc = db.getAllSync('SELECT COUNT(*) as c, COALESCE(SUM(price),0) as t FROM wishlists') as any[];

    setData({
      balance: (i[0]?.t||0)-(e[0]?.t||0), income: i[0]?.t||0, expense: e[0]?.t||0,
      todayExpense: te[0]?.t||0, todayIncome: ti[0]?.t||0,
      todayTodos: td[0]?.c||0, pendingTodos: pd[0]?.c||0,
      budgetCount: bc[0]?.c||0, budgetTotal: budgetRows[0]?.t||0, budgetSpent: spentRows[0]?.t||0,
      activeDebts: ac[0]?.c||0, debtTotal: ad[0]?.t||0,
      totalTrades: tp[0]?.c||0, tradePL: tp[0]?.t||0,
      totalInvested: inv[0]?.t||0,
      wishlistCount: wc[0]?.c||0, wishlistTotal: wc[0]?.t||0,
    });
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, []));
  const onRefresh = () => { setRefreshing(true); loadData(); setTimeout(() => setRefreshing(false), 300); };

  const quickActions = [
    { icon: 'plus-circle', label: 'Transaksi', route: '/(tabs)/finance', color: c.primary },
    { icon: 'calendar-check', label: 'Todo', route: '/(tabs)/activities', color: c.success },
    { icon: 'star', label: 'Wishlist', route: '/(tabs)/wishlist', color: c.warning },
    { icon: 'chart-pie', label: 'Laporan', route: '/reports', color: c.info },
  ];

  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, backgroundColor: c.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.textMuted }}>Selamat Pagi</Text>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{todayStr}</Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primaryBg, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="account" size={22} color={c.primary} />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ flexDirection: 'row', padding: Spacing.lg, gap: Spacing.md, backgroundColor: c.surface, marginBottom: 1 }}>
        {quickActions.map(q => (
          <TouchableOpacity key={q.route} style={{ flex: 1, alignItems: 'center', gap: 6, minHeight: 56, justifyContent: 'center' }}
            onPress={() => router.push(q.route as any)}>
            <MaterialCommunityIcons name={q.icon as any} size={28} color={q.color} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: c.text }}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Balance Hero */}
      <View style={{ margin: Spacing.lg, padding: Spacing.xl, borderRadius: BorderRadius.xl, backgroundColor: c.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <MaterialCommunityIcons name="wallet-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Total Saldo</Text>
        </View>
        <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -1, color: '#fff', marginBottom: Spacing.lg }} numberOfLines={1} adjustsFontSizeToFit>
          {fmt(data.balance, 'IDR')}
        </Text>
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: BorderRadius.md, padding: Spacing.md }}>
          <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <MaterialCommunityIcons name="arrow-up-circle" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Pemasukan</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }} numberOfLines={1} adjustsFontSizeToFit>{fmt(data.income, 'IDR')}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.md }} />
          <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <MaterialCommunityIcons name="arrow-down-circle" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Pengeluaran</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }} numberOfLines={1} adjustsFontSizeToFit>{fmt(data.expense, 'IDR')}</Text>
          </View>
        </View>
      </View>

      {/* Summary Grid */}
      <View style={{ paddingHorizontal: Spacing.lg, gap: Spacing.md }}>
        <Text style={{ ...Typography.smallBold, color: c.textSecondary, paddingHorizontal: 2 }}>Ringkasan</Text>

        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <TouchableOpacity onPress={() => router.push('/budget')} style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.surface }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.warningBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm }}>
              <MaterialCommunityIcons name="calculator-variant" size={18} color={c.warning} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 2 }}>{data.budgetCount}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Budget Aktif</Text>
            {data.budgetTotal > 0 && (
              <View style={{ height: 4, backgroundColor: c.gray100, borderRadius: 2, marginTop: Spacing.sm, overflow: 'hidden' }}>
                <View style={{ height: 4, backgroundColor: c.success, borderRadius: 2, width: `${Math.min((data.budgetSpent / data.budgetTotal) * 100, 100)}%` }} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/debts')} style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.surface }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.errorBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm }}>
              <MaterialCommunityIcons name="handshake" size={18} color={c.error} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 2 }}>{data.activeDebts}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Hutang/Piutang</Text>
            {data.activeDebts > 0 && <Text style={{ fontSize: 12, fontWeight: '600', color: c.error, marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>{fmt(data.debtTotal, 'IDR')}</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <TouchableOpacity onPress={() => router.push('/trading')} style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.surface }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.successBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm }}>
              <MaterialCommunityIcons name="trending-up" size={18} color={c.success} />
            </View>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Trading</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 2 }}>{data.totalTrades} trade</Text>
            {data.totalTrades > 0 && <Text style={{ fontSize: 12, fontWeight: '600', color: data.tradePL >= 0 ? c.success : c.error }} numberOfLines={1} adjustsFontSizeToFit>{fmt(data.tradePL, 'IDR')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/investing')} style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.surface }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.infoBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm }}>
              <MaterialCommunityIcons name="chart-line" size={18} color={c.info} />
            </View>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Investasi</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 2 }} numberOfLines={1} adjustsFontSizeToFit>{fmt(data.totalInvested, 'IDR')}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Total Invest</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(tabs)/wishlist')} style={{ flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: c.surface }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.warningBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm }}>
              <MaterialCommunityIcons name="star" size={18} color={c.warning} />
            </View>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Wishlist</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 2 }}>{data.wishlistCount}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted }}>Barang</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Activity */}
      <View style={{ margin: Spacing.lg, padding: Spacing.xl, borderRadius: BorderRadius.lg, backgroundColor: c.surface }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg }}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={c.primary} />
          <Text style={{ ...Typography.smallBold, color: c.text }}>Aktifitas Hari Ini</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: c.primary }}>{data.todayTodos}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'center' }}>Jatuh Tempo</Text>
          </View>
          <View style={{ width: 1, height: 36, backgroundColor: c.surfaceBorder }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: data.pendingTodos > 0 ? c.warning : c.success }}>{data.pendingTodos}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'center' }}>Perlu Dikerjakan</Text>
          </View>
          <View style={{ width: 1, height: 36, backgroundColor: c.surfaceBorder }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <MaterialCommunityIcons name={data.todayExpense > 0 ? 'cash-minus' : 'check-circle'} size={24} color={data.todayExpense > 0 ? c.error : c.success} />
            <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'center', marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>{data.todayExpense > 0 ? fmt(data.todayExpense, 'IDR') : 'Tidak Ada'}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}
