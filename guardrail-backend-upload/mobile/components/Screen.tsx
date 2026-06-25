import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  inner: { flex: 1, padding: theme.spacing.lg }
});
