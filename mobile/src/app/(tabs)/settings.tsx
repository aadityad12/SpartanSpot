import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Emblem, Icon, typography } from '../../components/ui';
import { useParking } from '../../store';
import { colors } from '../../theme';

export default function SettingsScreen() {
  const { apiUrl, setApiUrl, connected, error, storageError } = useParking();
  const [url, setUrl] = useState(apiUrl);
  const [message, setMessage] = useState('');
  const connect = () => {
    const value = url.trim().replace(/\/$/, '');
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error();
      setApiUrl(value);
      setMessage('Server saved. Check the connection status below.');
    } catch {
      setMessage('Enter a server origin, such as http://192.168.1.10:8000. Do not include a path or credentials.');
    }
  };
  return <SafeAreaView edges={['top']} style={{ flex: 1 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><Text style={typography.eyebrow}>MAKE YOURSELF AT HOME</Text><Text style={[typography.title, { marginTop: 13, marginBottom: 24 }]}>Your Spartan Spot.</Text><View style={styles.card}><View style={styles.row}><Icon name="radio" color={colors.primary} /><Text style={typography.section}>Parking data</Text></View><Text style={typography.subtitle}>Connect to the Python parking API on your computer. Your phone and server should be on the same trusted Wi-Fi network.</Text><Text style={styles.label}>SERVER ADDRESS</Text><TextInput accessibilityLabel="Parking API server address" value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://192.168.1.10:8000" placeholderTextColor={colors.muted} style={styles.input} /><Button title="Connect parking server" onPress={connect} icon="link" /><Button title="Explore demo instead" onPress={() => { setUrl(''); setApiUrl(''); setMessage('Demo mode enabled. All lot counts are sample data.'); }} secondary /><Text accessibilityLiveRegion="polite" style={styles.feedback}>{message}</Text><View style={styles.status}><View style={[styles.dot, { backgroundColor: connected ? colors.primary : colors.amber }]} /><Text style={styles.statusText}>{!apiUrl ? 'Demo mode · sample data' : connected ? 'Server connected' : 'Not connected'}</Text></View>{error && <Text style={styles.error}>{error}</Text>}</View><View style={styles.card}><View style={styles.row}><Icon name="shield" color={colors.primary} /><Text style={typography.section}>Private by design</Text></View><Text style={typography.subtitle}>Saved lots and parking reminders live only on this device. The app does not request your location, access your camera, or display license plates.</Text><Text style={typography.subtitle}>Reminders are stored without encryption. Don’t put personal information in a parking note. The read-only parking server has no authentication: use it only on trusted networks, or add HTTPS and authentication before public deployment.</Text>{storageError && <Text style={styles.error}>Device storage is unavailable. Changes may not persist after you close the app.</Text>}</View><View style={styles.about}><Emblem size={36} /><Text style={styles.appName}>spartan spot.</Text><Text style={styles.version}>Version 1.0.0 · Built for a better campus day</Text></View></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { padding: 24, maxWidth: 560, width: '100%', alignSelf: 'center', gap: 0 },
  card: { padding: 20, backgroundColor: colors.white, borderRadius: 22, borderWidth: 1, borderColor: colors.border, marginBottom: 18, gap: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 9, color: colors.muted, letterSpacing: 1.3, fontWeight: '700', marginTop: 4 },
  input: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, fontSize: 13, color: colors.ink, backgroundColor: colors.background },
  feedback: { fontSize: 12, color: colors.primary, lineHeight: 19 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: colors.ink, fontWeight: '600', fontSize: 12 },
  error: { color: colors.red, fontSize: 12, lineHeight: 19 },
  about: { alignItems: 'center', gap: 12, padding: 22 },
  appName: { fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: -1 },
  version: { color: colors.muted, fontSize: 10 },
});
