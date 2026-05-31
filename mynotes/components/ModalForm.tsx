import { Modal, View, Text, TouchableOpacity, ScrollView, Keyboard, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { BorderRadius } from '../constants/theme';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ModalForm({ visible, title, onClose, children, footer }: Props) {
  const { colors } = useColors();
  const insets = useSafeAreaInsets();
  const c = colors;
  const [kb, setKb] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e =>
      setKb(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setKb(0)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const bottomPad = kb + insets.bottom;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={onClose} />

        <View style={{
          backgroundColor: c.surface,
          borderTopLeftRadius: BorderRadius.xl,
          borderTopRightRadius: BorderRadius.xl,
          paddingBottom: bottomPad,
        }}>
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 5, borderRadius: 2.5, backgroundColor: c.gray300 }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: c.text }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <MaterialCommunityIcons name="close" size={24} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: 400 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
