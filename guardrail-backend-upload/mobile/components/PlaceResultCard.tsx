import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export function PlaceResultCard({
  title,
  address,
  onPress
}: {
  title: string;
  address: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6
  },
  address: {
    fontSize: 14,
    color: theme.colors.muted
  }
});
