import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

export default function HistoryScreen() {
  const events = useAppStore((state) => state.events);
  const markSkipped = useAppStore((state) => state.markSkipped);

  return (
    <Screen>
      <Text style={styles.title}>History</Text>
      {events.length === 0 ? (
        <View style={styles.item}><Text style={styles.itemTitle}>No guardrails yet</Text><Text style={styles.itemMeta}>Send a test guardrail from Home to populate this timeline.</Text></View>
      ) : (
        events.map((event) => (
          <View style={styles.item} key={event.id}>
            <Text style={styles.itemTitle}>{event.message}</Text>
            <Text style={styles.itemMeta}>Estimated save: ${event.predictedSpend} · Outcome: {event.outcome ?? 'pending'}</Text>
            {!event.outcome ? (
              <Pressable style={styles.action} onPress={() => markSkipped(event.id)}>
                <Text style={styles.actionText}>Mark as skipped</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: theme.colors.text, marginTop: 16, marginBottom: 18 },
  item: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 18, marginBottom: 12 },
  itemTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  itemMeta: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  action: { marginTop: 12, backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.pill, paddingVertical: 12, paddingHorizontal: 14, alignSelf: 'flex-start' },
  actionText: { color: theme.colors.primary, fontWeight: '700' }
});
