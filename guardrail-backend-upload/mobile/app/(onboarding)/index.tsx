import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressDots } from '../../components/ProgressDots';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.wrap}>
        <ProgressDots current={1} total={4} />
        <Text style={styles.eyebrow}>Guardrail</Text>
        <Text style={styles.title}>Protect your money before you spend it.</Text>
        <Text style={styles.body}>Your data never leaves this phone. No bank logins required.</Text>
        <Pressable style={styles.primary} onPress={() => router.push('/(onboarding)/goal')}>
          <Text style={styles.primaryText}>Continue with Apple</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.push('/(onboarding)/goal')}>
          <Text style={styles.secondaryText}>Continue with Google</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  eyebrow: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, marginBottom: 12 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  body: { fontSize: 17, lineHeight: 26, color: theme.colors.muted, marginBottom: 32 },
  primary: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.radius.pill, marginBottom: 12 },
  secondary: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 18, borderRadius: theme.radius.pill },
  primaryText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  secondaryText: { color: theme.colors.text, textAlign: 'center', fontWeight: '700', fontSize: 16 }
});
