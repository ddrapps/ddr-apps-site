import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OptionCard } from '../../components/OptionCard';
import { ProgressDots } from '../../components/ProgressDots';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

export default function DangerZoneScreen() {
  const setDangerZones = useAppStore((state) => state.setDangerZones);

  const pick = (category: 'coffee' | 'big_box' | 'fast_food', label: string, spend = 20) => {
    setDangerZones([
      {
        id: `${category}-preset`,
        category,
        label,
        radiusMeters: 120,
        enabled: true,
        identifier: `${label}-${spend}`
      }
    ]);
    router.push({ pathname: '/(onboarding)/place-search', params: { category, label } });
  };

  return (
    <Screen>
      <ProgressDots current={3} total={5} />
      <Text style={styles.title}>Where do you accidentally spend the most money?</Text>
      <Text style={styles.body}>Choose a spending category, then pick a real place to guard.</Text>
      <View style={styles.list}>
        <OptionCard title="Coffee Shops" subtitle="Catch quick daily spending leaks." onPress={() => pick('coffee', 'Coffee Shops', 8)} />
        <OptionCard title="Target / Big Box" subtitle="Stop cart creep before it starts." onPress={() => pick('big_box', 'Target / Big Box', 40)} />
        <OptionCard title="Fast Food & Dining" subtitle="Protect your food budget in real time." onPress={() => pick('fast_food', 'Fast Food & Dining', 18)} />
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
