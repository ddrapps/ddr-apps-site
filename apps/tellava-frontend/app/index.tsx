import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { InfoCard } from '@/components/InfoCard';
import { colors } from '@/constants/theme';
import { getApiBaseUrl, getHealth } from '@/lib/api';

type HealthResponse = {
  ok?: boolean;
  status?: string;
  service?: string;
  timestamp?: string;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runHealthCheck() {
    setLoading(true);
    setError(null);
    try {
      const result = await getHealth();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Tellava mobile starter</Text>
          <Text style={styles.title}>Expo front end wired to your Render backend</Text>
          <Text style={styles.subtitle}>
            This starter confirms the mobile app can reach your backend before we build the real screens.
          </Text>
        </View>

        <InfoCard title="Backend target">
          <Text style={styles.code}>{getApiBaseUrl()}</Text>
          <Text style={styles.help}>Set EXPO_PUBLIC_API_URL in .env if you change the backend URL.</Text>
        </InfoCard>

        <InfoCard title="Connection test">
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.body}>Checking backend health…</Text>
            </View>
          ) : error ? (
            <>
              <Text style={styles.error}>{error}</Text>
              <Pressable style={styles.button} onPress={runHealthCheck}>
                <Text style={styles.buttonText}>Try again</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.body}>Status: {String(data?.status || data?.ok || 'unknown')}</Text>
              <Text style={styles.body}>Service: {data?.service || 'tellava-backend'}</Text>
              <Text style={styles.body}>Timestamp: {data?.timestamp || 'not returned'}</Text>
              <Pressable style={styles.button} onPress={runHealthCheck}>
                <Text style={styles.buttonText}>Refresh health check</Text>
              </Pressable>
            </>
          )}
        </InfoCard>

        <InfoCard title="Next build steps">
          <Text style={styles.body}>1. Upload this folder to GitHub.</Text>
          <Text style={styles.body}>2. Run npm install.</Text>
          <Text style={styles.body}>3. Start with npx expo start.</Text>
          <Text style={styles.body}>4. Replace this screen with the real Tellava flows.</Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  hero: {
    gap: 10,
    paddingVertical: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
  },
  help: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  code: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    backgroundColor: colors.primarySoft,
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  error: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.danger,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
