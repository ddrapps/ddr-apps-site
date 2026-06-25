import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressDots } from '../../components/ProgressDots';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { requestGuardrailPermissions, startGuardrailRegions } from '../../lib/geofence';
import { useAppStore } from '../../store/useAppStore';

export default function PermissionsScreen() {
  const zones = useAppStore((state) => state.dangerZones);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const firstZone = zones[0];
  const zoneLabel = firstZone?.label ?? 'your danger zone';

  const handleContinue = async () => {
    const result = await requestGuardrailPermissions();
    if (result.ok) {
      updateSettings({ hasBackgroundLocation: true });
      await startGuardrailRegions(zones);
    }
    router.replace('/(tabs)/home');
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <ProgressDots current={5} total={5} />
        <Text style={styles.title}>Enable automated guardrails</Text>
        <Text style={styles.body}>
          To send you automated spending guardrails when you walk into {zoneLabel}, we need location access. Set this to Always Allow so we can protect your wallet in the background.
        </Text>
        {firstZone?.address ? <Text style={styles.caption}>Selected place: {firstZone.address}</Text> : null}
        <Pressable style={styles.primary} onPress={handleContinue}>
          <Text style={styles.primaryText}>Enable Guardrails</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.secondaryText}>Not now</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  body: { fontSize: 17, lineHeight: 26, color: theme.colors.muted, marginBottom: 14 },
  caption: { fontSize: 14, lineHeight: 20, color: theme.colors.primary, marginBottom: 24 },
  primary: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.radius.pill, marginBottom: 12 },
  secondary: { padding: 18, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  primaryText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  secondaryText: { color: theme.colors.text, textAlign: 'center', fontWeight: '700', fontSize: 16 }
});
