import { useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../../types/exercises';
import { colors } from '../../../theme';

type Props = {
  item: Exercise;
  onPress: () => void;
  onDelete: () => void;
  onSetOpenSwipeable?: (ref: Swipeable | null) => void;
};

export default function ExerciseRow({ item, onPress, onDelete, onSetOpenSwipeable }: Props) {
  const swipeRef = useRef<Swipeable | null>(null);

  const pb = useMemo(() => {
    let maxOverload = null as null | { weight: number; reps: number; value: number };
    item.sessions.forEach(session => {
      session.sets.forEach(set => {
        if (
          typeof set.weight === 'number' &&
          typeof set.reps === 'number' &&
          set.weight > 0 &&
          set.reps > 0
        ) {
          const value = set.weight * set.reps;
          if (!maxOverload || value > maxOverload.value) {
            maxOverload = { weight: set.weight, reps: set.reps, value };
          }
        }
      });
    });
    return maxOverload;
  }, [item.sessions]);

  function SwipeLeftMenu(progress: any, dragX: any) {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={onDelete}
        activeOpacity={0.7}
      >
        <Animated.Text style={[styles.deleteText, { transform: [{ translateX: trans }] }]}>
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
      renderRightActions={SwipeLeftMenu}
      onSwipeableWillOpen={() => {
        if (onSetOpenSwipeable) {
          onSetOpenSwipeable(swipeRef.current);
        }
      }}
      ref={(r) => { swipeRef.current = r; }}
    >
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={styles.flex}>
          <Text style={styles.title}>{item.title}</Text>
          {item.sessions.length > 0 ? (
            <Text style={styles.meta}>
              PB:{" "}
              {pb
                ? `× ${pb.reps} x ${pb.weight}kg`
                : "-"}
            </Text>
          ) : (
            <Text style={styles.meta}>No sessions yet</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.darkBlue,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white
  },
  meta: {
    color: colors.white,
    marginTop: 8,
  },
  deleteAction: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    height: '86%',
    alignSelf: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
    paddingRight: 6,
  },
});
