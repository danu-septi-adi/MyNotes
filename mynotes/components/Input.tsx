import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { BorderRadius, Spacing } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  containerStyle?: ViewStyle;
}

export default function Input({ label, error, icon, containerStyle, style, ...props }: InputProps) {
  const { colors } = useColors();
  const c = colors;

  return (
    <View style={[{ marginBottom: Spacing.md, paddingHorizontal: Spacing.lg }, containerStyle]}>
      {label && <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 4 }}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: error ? c.error : c.gray200, borderRadius: BorderRadius.sm, backgroundColor: c.surface, minHeight: 44 }}>
        {icon && <MaterialCommunityIcons name={icon as any} size={18} color={c.textMuted} style={{ marginLeft: 10 }} />}
        <TextInput
          style={[{ flex: 1, fontSize: 15, color: c.text, paddingHorizontal: 12, paddingVertical: 10 }, icon && { paddingLeft: 6 }, style]}
          placeholderTextColor={c.textMuted}
          {...props}
        />
      </View>
      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <MaterialCommunityIcons name="alert-circle" size={12} color={c.error} />
          <Text style={{ fontSize: 11, color: c.error }}>{error}</Text>
        </View>
      )}
    </View>
  );
}
