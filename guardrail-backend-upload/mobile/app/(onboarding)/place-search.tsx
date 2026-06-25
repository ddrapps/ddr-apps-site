import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PlaceResultCard } from '../../components/PlaceResultCard';
import { ProgressDots } from '../../components/ProgressDots';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { placeToDangerZone, searchPlacesViaBackend } from '../../lib/places';
import { useAppStore } from '../../store/useAppStore';
import { DangerZoneCategory, PlaceResult } from '../../types/app';

export default function PlaceSearchScreen() {
  const { category } = useLocalSearchParams<{ category: DangerZoneCategory }>();
  const addDangerZone = useAppStore((state) => state.addDangerZone);
  const [query, setQuery] = useState(category === 'coffee' ? 'starbucks' : '');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      const items = await searchPlacesViaBackend(query, category);
      if (active) setResults(items);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [query, category]);

  return (
    <Screen>
      <ProgressDots current={4} total={5} />
      <Text style={styles.title}>Pick the place to guard</Text>
      <Text style={styles.body}>Search a real place. Starbucks is preloaded for testing, and the mobile app now supports a full backend API instead of sending Google requests from the client.</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search a store or place"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
      />
      {loading ? <ActivityIndicator color={theme.colors.primary} style={styles.loader} /> : null}
      <View style={styles.results}>
        {results.map((result) => (
          <PlaceResultCard
            key={result.id}
            title={result.label}
            address={result.address}
            onPress={() => {
              addDangerZone(placeToDangerZone(result));
              router.push('/(onboarding)/permissions');
            }}
          />
        ))}
      </View>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', color: theme.colors.text, marginTop: 8, marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: theme.colors.muted, marginBottom: 20 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: theme.colors.text,
    marginBottom: 16
  },
  loader: { marginBottom: 16 },
  results: { flex: 1 },
  back: { paddingVertical: 16 },
  backText: { color: theme.colors.muted, fontWeight: '600' }
});
