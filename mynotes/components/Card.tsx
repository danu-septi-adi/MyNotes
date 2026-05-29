import { View, Text, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { BorderRadius, Spacing, Typography } from '../constants/theme';

interface CardProps { children: React.ReactNode; style?: ViewStyle; noPadding?: boolean; }

export function Card({ children, style, noPadding }: CardProps) {
  const { colors } = useColors();
  return <View style={[{ backgroundColor: colors.surface, borderRadius: BorderRadius.lg, ...(noPadding ? {} : { padding: Spacing.lg }) }, style]}>{children}</View>;
}

interface StatCardProps { icon: string; label: string; value: string; color?: string; backgroundColor?: string; subtitle?: string; }

export function StatCard({ icon, label, value, color, backgroundColor, subtitle }: StatCardProps) {
  const { colors } = useColors();
  const c = colors;
  const bg = backgroundColor || c.primaryBg;
  const clr = color || c.primary;
  return (
    <View style={{ flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg, backgroundColor: bg }}>
      <View style={{ width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: clr, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md }}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#fff" />
      </View>
      <Text style={{ ...Typography.caption, color: c.textMuted, marginBottom: Spacing.xs }}>{label}</Text>
      <Text style={{ ...Typography.h3, color: clr, marginBottom: subtitle ? Spacing.xs : 0 }}>{value}</Text>
      {subtitle ? <Text style={{ ...Typography.caption, color: c.textMuted }}>{subtitle}</Text> : null}
    </View>
  );
}

interface EmptyStateProps { icon: string; title: string; description: string; }

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const { colors } = useColors();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: Spacing.xxxl }}>
      <MaterialCommunityIcons name={icon as any} size={64} color={colors.textMuted} />
      <Text style={{ ...Typography.h4, color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }}>{title}</Text>
      <Text style={{ ...Typography.small, color: colors.textMuted, textAlign: 'center' }}>{description}</Text>
    </View>
  );
}
