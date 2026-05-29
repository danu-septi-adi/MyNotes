import { Modal, View, Text, TouchableOpacity, Animated, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { BorderRadius, Spacing } from '../constants/theme';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ModalForm({ visible, title, onClose, children, footer }: Props) {
  const { colors } = useColors();
  const c = colors;
  const slide = useRef(new Animated.Value(400)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    if (visible) Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }).start();
    else slide.setValue(400);
  }, [visible]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[{ backgroundColor: c.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '85%', paddingBottom: kbHeight }, { transform: [{ translateY: slide }] }]}>
              <View style={{ alignItems: 'center', paddingTop: 8, borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }}>
                <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: c.gray300 }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
                <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: c.text }}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={{ padding: 4, minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="close" size={22} color={c.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView ref={scrollRef} style={{ maxHeight: 350 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {children}
              </ScrollView>
              {footer && <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl }}>{footer}</View>}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
