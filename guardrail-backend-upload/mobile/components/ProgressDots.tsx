import { StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={[styles.dot, index < current && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: theme.colors.border },
  active: { backgroundColor: theme.colors.primary }
});
