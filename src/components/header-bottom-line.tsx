import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function HeaderBottomLine() {
  return <View style={styles.line} />;
}

const styles = StyleSheet.create({
  line: {
    width: '50%',
    height: 2,
    backgroundColor: colors.darkBlue,
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 8,
  },
});
