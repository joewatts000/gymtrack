import { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../../types/exercises';

type Props = {
  item: Exercise;
  onPress: () => void;
  onDelete: () => void;
  // parent provides a setter to coordinate open swipeables:
  onSetOpenSwipeable?: (ref: Swipeable | null) => void;
};

export default function ExerciseRow({ item, onPress, onDelete, onSetOpenSwipeable }: Props) {
  const swipeRef = useRef<Swipeable | null>(null);

  function renderRightActions(progress: any, dragX: any) {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });
    return (
      <TouchableOpacity style={{
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 12,
        height: '86%',
        alignSelf: 'center',
      }} onPress={onDelete} activeOpacity={0.7}>
        <Animated.Text style={{ color: '#fff', fontWeight: '700', paddingRight: 6, transform: [{ translateX: trans }] }}>
          Delete
        </Animated.Text>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      friction={2}
      leftThreshold={80}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        // close previous and set this as open
        if (onSetOpenSwipeable) {
          onSetOpenSwipeable(swipeRef.current);
        }
      }}
      ref={(r) => { swipeRef.current = r; }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: '#f7f7f8',
          padding: 16,
          borderRadius: 10,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={onPress}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.title}</Text>
          {item.sessions[0] ? (
            <Text style={{ color: '#666', marginTop: 4 }}>
              Current session: {item.sessions[0].sets.length} sets • {new Date(item.sessions[0].createdAt).toLocaleString()}
            </Text>
          ) : (
            <Text style={{ color: '#666', marginTop: 4 }}>No sessions yet — tap to add one</Text>
          )}
          {item.sessions[1] && (
            <Text style={{ color: '#999', marginTop: 4, fontSize: 12 }}>
              Previous: {item.sessions[1].sets.length} sets • {new Date(item.sessions[1].createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </Swipeable>
  );
}
