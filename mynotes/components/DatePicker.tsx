import { View, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { Spacing, BorderRadius } from '../constants/theme';

interface Props {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export default function DatePicker({ value, onChange, label }: Props) {
  const { colors } = useColors(); const c = colors;

  return (
    <View style={{ marginBottom: Spacing.md, paddingHorizontal: Spacing.lg }}>
      {label && <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 4 }}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.gray200, borderRadius: BorderRadius.sm, paddingHorizontal: 12, height: 44, backgroundColor: c.surface }}>
        <MaterialCommunityIcons name="calendar" size={18} color={c.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, fontSize: 15, color: c.text, paddingVertical: 0 }}
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={c.textMuted}
        />
      </View>
    </View>
  );
}
