import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { buildInterventionMessage, estimateSpendByCategory } from '../../lib/interventions';
import { sendGuardrailNotification } from '../../lib/notifications';
import { useAppStore } from '../../store/useAppStore';

function Card({ title, value, subtext }: { title: string; value: string; subtext: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardSubtext}>{subtext}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const goal = useAppStore((state) => state.goal);
  const dangerZones = useAppStore((state) => state.dangerZones);
  const savedTotal = useAppStore((state) => state.savedTotal);
  const streakDays = useAppStore((state) => state.streakDays);
  const addEvent = useAppStore((state) => state.addEvent);
  const firstZone = dangerZones[0];
  const estimatedSpend = estimateSpendByCategory(firstZone?.category ?? 'coffee');
  const preview = buildInterventionMessage(goal, firstZone?.label ?? 'Starbucks', estimatedSpend);

  const sendPreview = async () => {
    const event = {
      id: `event-${Date.now()}`,
      dangerZoneId: firstZone?.id ?? 'preview-zone',
      timestamp: new Date().toISOString(),
      predictedSpend: estimatedSpend,
      message: preview
    };
    addEvent(event);
    await sendGuardrailNotification('Guardrail preview', preview, { zone: firstZone?.label ?? 'Starbucks', url: '/(tabs)/history' });
  };

  return (
    <Screen>
      <Text style={styles.title}>Your wallet has backup.</Text>
      <Text style={styles.body}>You have {dangerZones.length} saved guardrail zone{dangerZones.length === 1 ? '' : 's'} protecting {goal?.label ?? 'your goal'}.</Text>
      <View style={styles.grid}>
        <Card title="Win Wallet" value={`$${savedTotal}`} subtext="Saved from skipped impulse buys" />
        <Card title="Current Streak" value={`${streakDays} days`} subtext="Guardrail confirmations in a row" />
        <Card title="Primary Zone" value={firstZone?.label ?? 'Starbucks'} subtext={firstZone?.address ?? 'First selected place'} />
        <Card title="Goal Progress" value="18%" subtext="Placeholder metric for MVP flow" />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Recent intervention preview</Text>
        <Text style={styles.panelBody}>{preview}</Text>
      </View>
      <Pressable style={styles.primary} onPress={sendPreview}>
        <Text style={styles.primaryText}>Send test guardrail</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: theme.colors.text, marginTop: 16, marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: theme.colors.muted, marginBottom: 24 },
  grid: { gap: 12 },
  card: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 18 },
  cardTitle: { color: theme.colors.muted, fontSize: 14, marginBottom: 8 },
  cardValue: { color: theme.colors.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  cardSubtext: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  panel: { marginTop: 18, backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md, padding: 18 },
  panelTitle: { color: theme.colors.primary, fontWeight: '700', marginBottom: 8, fontSize: 15 },
  panelBody: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  primary: { marginTop: 16, backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.radius.pill },
  primaryText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 }
});
