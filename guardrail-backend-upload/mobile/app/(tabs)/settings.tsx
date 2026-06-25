import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

export default function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const dangerZones = useAppStore((state) => state.dangerZones);
  const removeDangerZone = useAppStore((state) => state.removeDangerZone);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetAll = useAppStore((state) => state.resetAll);

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.item}><Text style={styles.label}>Quiet hours</Text><Text style={styles.value}>{settings.quietHoursStart} - {settings.quietHoursEnd}</Text></View>
      <View style={styles.item}><Text style={styles.label}>Notification sensitivity</Text><Text style={styles.value}>{settings.sensitivity}</Text></View>
      <View style={styles.item}><Text style={styles.label}>Subscription</Text><Text style={styles.value}>{settings.subscriptionTier}</Text></View>
      <View style={styles.item}><Text style={styles.label}>Background location</Text><Text style={styles.value}>{settings.hasBackgroundLocation ? 'Enabled' : 'Not enabled'}</Text></View>
      <View style={styles.item}>
        <Text style={styles.label}>Saved danger zones</Text>
        {dangerZones.length === 0 ? <Text style={styles.value}>None yet</Text> : dangerZones.map((zone) => (
          <View key={zone.id} style={styles.zoneRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneTitle}>{zone.label}</Text>
              <Text style={styles.zoneAddress}>{zone.address ?? 'No address saved'}</Text>
            </View>
            <Pressable onPress={() => removeDangerZone(zone.id)} style={styles.zoneRemove}><Text style={styles.zoneRemoveText}>Remove</Text></Pressable>
          </View>
        ))}
      </View>
      <Pressable style={styles.secondary} onPress={() => updateSettings({ sensitivity: settings.sensitivity === 'balanced' ? 'high' : 'balanced' })}>
        <Text style={styles.secondaryText}>Toggle sensitivity</Text>
      </Pressable>
      <Pressable style={styles.reset} onPress={resetAll}>
        <Text style={styles.resetText}>Reset demo data</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: theme.colors.text, marginTop: 16, marginBottom: 18 },
  item: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 18, marginBottom: 12 },
  label: { color: theme.colors.muted, fontSize: 14, marginBottom: 6 },
  value: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  zoneTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  zoneAddress: { color: theme.colors.muted, fontSize: 13, marginTop: 2 },
  zoneRemove: { backgroundColor: '#FCE9E2', borderRadius: theme.radius.pill, paddingVertical: 10, paddingHorizontal: 12 },
  zoneRemoveText: { color: theme.colors.danger, fontWeight: '700' },
  secondary: { marginTop: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 18, borderRadius: theme.radius.pill },
  secondaryText: { color: theme.colors.text, textAlign: 'center', fontWeight: '700', fontSize: 16 },
  reset: { marginTop: 12, backgroundColor: '#FCE9E2', padding: 18, borderRadius: theme.radius.pill },
  resetText: { color: theme.colors.danger, textAlign: 'center', fontWeight: '700', fontSize: 16 }
});
