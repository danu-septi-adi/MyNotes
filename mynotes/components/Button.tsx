import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useColors } from '../hooks/useColors';
import { BorderRadius, Spacing } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style, textStyle }: ButtonProps) {
  const { colors } = useColors();
  const c = colors;

  const btnStyle = [
    { borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' as const },
    variant === 'primary' && { backgroundColor: c.primary },
    variant === 'secondary' && { backgroundColor: c.gray100 },
    variant === 'outline' && { backgroundColor: c.surface, borderWidth: 2, borderColor: c.gray200 },
    variant === 'danger' && { backgroundColor: c.error },
    size === 'sm' && { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 40 },
    size === 'md' && { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 48 },
    size === 'lg' && { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, minHeight: 56 },
    (disabled || loading) && { opacity: 0.5 },
    style,
  ];

  const txtStyle = [
    { fontWeight: '600' as const },
    variant === 'primary' && { color: '#fff' },
    variant === 'secondary' && { color: c.text },
    variant === 'outline' && { color: c.text },
    variant === 'danger' && { color: '#fff' },
    size === 'sm' && { fontSize: 14 },
    size === 'md' && { fontSize: 16 },
    size === 'lg' && { fontSize: 18 },
    textStyle,
  ];

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
      {loading ? <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : c.primary} /> : <Text style={txtStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}
