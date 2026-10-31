import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { demoFeed, fetchParkingFeed, type ParkingFeed } from './data';

type ParkingSession = { lotId: string; lotName: string; note: string; startedAt: string; demo: boolean };
type Preferences = { favorites: string[]; session: ParkingSession | null; apiUrl: string };
type Store = Preferences & {
  feed: ParkingFeed;
  loading: boolean;
  error: string | null;
  storageError: boolean;
  connected: boolean;
  stale: boolean;
  refresh: () => Promise<void>;
  toggleFavorite: (id: string) => void;
  park: (session: ParkingSession) => void;
  clearSession: () => void;
  setApiUrl: (url: string) => void;
};

const storageKey = 'spartanspot.preferences.v1';
const defaultUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
const initial: Preferences = { favorites: [], session: null, apiUrl: defaultUrl };
const ParkingContext = createContext<Store | null>(null);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(initial);
  const [ready, setReady] = useState(false);
  const [feed, setFeed] = useState<ParkingFeed>(demoFeed);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const requestId = useRef(0);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey).then(value => {
      if (!value || !mounted) return;
      const saved = JSON.parse(value);
      const session = saved.session;
      setPreferences({
        apiUrl: typeof saved.apiUrl === 'string' ? saved.apiUrl : defaultUrl,
        favorites: Array.isArray(saved.favorites) ? saved.favorites.filter((id: unknown) => typeof id === 'string') : [],
        session: session && typeof session.lotId === 'string' && typeof session.lotName === 'string'
          && typeof session.note === 'string' && typeof session.demo === 'boolean'
          && Number.isFinite(Date.parse(session.startedAt)) ? session : null,
      });
    }).catch(() => { if (mounted) setStorageError(true); })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(storageKey, JSON.stringify(preferences)).catch(() => setStorageError(true));
  }, [preferences, ready]);

  const refresh = useCallback(async () => {
    if (!ready) return;
    const currentRequest = ++requestId.current;
    if (!preferences.apiUrl) {
      setFeed(demoFeed);
      setConnected(false);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchParkingFeed(preferences.apiUrl);
      if (currentRequest !== requestId.current) return;
      setFeed(result);
      setNow(Date.now());
      setConnected(true);
      setError(null);
    } catch (reason) {
      if (currentRequest !== requestId.current) return;
      setConnected(false);
      setError(reason instanceof Error ? reason.message : 'Could not reach the parking server.');
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [preferences.apiUrl, ready]);

  useEffect(() => {
    const initialRefresh = setTimeout(() => {
      setFeed(preferences.apiUrl ? { mode: 'live', updatedAt: null, lots: [] } : demoFeed);
      setConnected(false);
      void refresh();
    }, 0);
    const interval = setInterval(() => { setNow(Date.now()); void refresh(); }, 15000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => { requestId.current += 1; clearTimeout(initialRefresh); clearInterval(interval); subscription.remove(); };
  }, [refresh, preferences.apiUrl]);

  const stale = feed.mode === 'live' && (!connected || !feed.updatedAt || now - Date.parse(feed.updatedAt) > 60000);

  return <ParkingContext.Provider value={{ ...preferences, feed, loading, error, storageError, connected, stale, refresh,
    toggleFavorite: id => setPreferences(current => ({ ...current, favorites: current.favorites.includes(id) ? current.favorites.filter(item => item !== id) : [...current.favorites, id] })),
    park: session => setPreferences(current => ({ ...current, session })),
    clearSession: () => setPreferences(current => ({ ...current, session: null })),
    setApiUrl: apiUrl => setPreferences(current => ({ ...current, apiUrl })),
  }}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) throw new Error('ParkingProvider is missing');
  return context;
}
