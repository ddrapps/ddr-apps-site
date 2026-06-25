import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OptionCard } from '../../components/OptionCard';
import { ProgressDots } from '../../components/ProgressDots';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

export default function GoalScreen() {
  const setGoal = useAppStore((state) => state.setGoal);

  return (
    <Screen>
      <ProgressDots current={2} total={4} />
      <Text style={styles.title}>What are we saving for?</Text>
      <Text style={styles.body}>Pick the goal that should power your guardrails.</Text>
      <View style={styles.list}>
        <OptionCard title="Travel / Vacation" subtitle="Turn skipped spending into trip progress." onPress={() => { setGoal({ id: 'goal-1', type: 'vacation', label: 'Vacation Fund' }); router.push('/(onboarding)/danger-zone'); }} />
        <OptionCard title="Clearing Debt" subtitle="Use guardrails to reduce lifestyle leaks." onPress={() => { setGoal({ id: 'goal-2', type: 'debt', label: 'Debt Paydown' }); router.push('/(onboarding)/danger-zone'); }} />
        <OptionCard title="Large Purchase / House" subtitle="Protect cash for your next milestone." onPress={() => { setGoal({ id: 'goal-3', type: 'large_purchase', label: 'Big Purchase' }); router.push('/(onboarding)/danger-zone'); }} />
      </View>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', color: theme.colors.text, marginTop: 8, marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: theme.colors.muted, marginBottom: 24 },
  list: { marginTop: 8 },
  back: { marginTop: 'auto', paddingVertical: 16 },
  backText: { color: theme.colors.muted, fontWeight: '600' }
});
