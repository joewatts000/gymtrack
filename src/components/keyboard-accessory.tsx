// src/components/keyboard-accessory.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

type Props = {
  style?: ViewStyle;
  onNext?: () => void;
  onSave?: () => void;
};

const BAR_HEIGHT = 56; // adjust if you change accessory height

export default function KeyboardAccessory({ style, onNext, onSave }: Props) {
  // animated bottom value (we'll animate to keyboardHeight - BAR_HEIGHT,
  // and to -BAR_HEIGHT when hidden so it sits off-screen)
  const animatedBottom = useRef(new Animated.Value(-BAR_HEIGHT)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const keyboardHeight = e.endCoordinates?.height ?? 300;
      const target = Math.max(0, keyboardHeight - BAR_HEIGHT); // bottom offset so bar sits above keyboard
      setVisible(true);

      Animated.timing(animatedBottom, {
        toValue: target,
        duration: 200,
        useNativeDriver: false, // cannot animate `bottom` with native driver
      }).start();
    };

    const onHide = () => {
      Animated.timing(animatedBottom, {
        toValue: -BAR_HEIGHT, // off-screen
        duration: 180,
        useNativeDriver: false,
      }).start(() => setVisible(false));
    };

    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedBottom]);

  // pointer events only active when visible
  const pointer = visible ? 'auto' : 'none';

  return (
    <Animated.View
      pointerEvents={pointer}
      style={[
        styles.container,
        style,
        {
          bottom: animatedBottom,
          height: BAR_HEIGHT,
        },
      ]}
    >
      <View style={styles.leftSpacer} />

      <TouchableOpacity
        onPress={() => onNext?.()}
        style={styles.nextBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSave?.()}
        style={styles.saveBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    // bottom is animated
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    zIndex: 9999,
    elevation: 30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },
  leftSpacer: { flex: 1 },
  nextBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  nextText: { color: '#007AFF', fontWeight: '700', fontSize: 16 },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
