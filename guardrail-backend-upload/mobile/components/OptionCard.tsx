import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export function OptionCard({
  title,
  subtitle,
  selected,
  onPress
}: {
  title: string;
  subtitle: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.selected]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
  selected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted
  }
});
