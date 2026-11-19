import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  SoilMeasurementRecord,
  SoilParameterKey,
  ParameterThreshold,
  CropThresholdPreset
} from '../types/thingspeak';
import { fetchThingSpeakFeeds } from '../services/thingspeakService';
import {
  generateRealisticDemoRecords,
  createSimulatedButtonUpload
} from '../services/demoDataService';
import { CROP_PRESETS, PARAMETER_CONFIGS } from '../utils/constants';

interface ToastNotification {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface SoilSenseContextType {
  // Data State
  records: SoilMeasurementRecord[];
  latestRecord: SoilMeasurementRecord | null;
  channelTitle: string;
  channelDescription?: string;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  
  // Mode & Configuration
  isDemoMode: boolean;
  demoPreset: 'greenhouse' | 'orchard' | 'standard_no_npk';
  channelId: string;
  readApiKey: string;
  autoRefreshInterval: number; // in seconds, 0 = off
  
  // Agronomic Thresholds
  selectedCropPreset: CropThresholdPreset;
  activeThresholds: Record<SoilParameterKey, ParameterThreshold>;
  
  // UI & Theming
  darkMode: boolean;
  selectedParameterModal: SoilParameterKey | null;
  selectedRecordModal: SoilMeasurementRecord | null;
  toast: ToastNotification | null;
  
  // Actions
  refreshData: () => Promise<void>;
  toggleDemoMode: (enabled?: boolean) => void;
  setDemoPreset: (preset: 'greenhouse' | 'orchard' | 'standard_no_npk') => void;
  simulateDeviceUpload: () => void;
  saveSettings: (channelId: string, apiKey: string, refreshInterval: number) => void;
  setCropPresetById: (presetId: string) => void;
  updateCustomThreshold: (key: SoilParameterKey, threshold: ParameterThreshold) => void;
  toggleDarkMode: () => void;
  openParameterModal: (key: SoilParameterKey) => void;
  closeParameterModal: () => void;
  openRecordModal: (record: SoilMeasurementRecord) => void;
  closeRecordModal: () => void;
  dismissToast: () => void;
}

const SoilSenseContext = createContext<SoilSenseContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_CHANNEL_ID = 'soilsense_channel_id';
const STORAGE_API_KEY = 'soilsense_api_key';
const STORAGE_REFRESH_INTERVAL = 'soilsense_refresh_sec';
const STORAGE_DEMO_MODE = 'soilsense_demo_mode';
const STORAGE_DEMO_PRESET = 'soilsense_demo_preset';
const STORAGE_CROP_PRESET = 'soilsense_crop_preset';
const STORAGE_DARK_MODE = 'soilsense_dark_mode';

export const SoilSenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Read initial environment or localStorage
  const envChannelId = import.meta.env.VITE_THINGSPEAK_CHANNEL_ID || '';
  const envApiKey = import.meta.env.VITE_THINGSPEAK_READ_API_KEY || '';
  const envRefresh = parseInt(import.meta.env.VITE_AUTO_REFRESH_SECONDS || '60', 10);
  const envDemoFallback = import.meta.env.VITE_ENABLE_DEMO_FALLBACK !== 'false';

  const [channelId, setChannelId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_CHANNEL_ID) ?? envChannelId;
  });

  const [readApiKey, setReadApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_API_KEY) ?? envApiKey;
  });

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_REFRESH_INTERVAL);
    return saved !== null ? parseInt(saved, 10) : (isNaN(envRefresh) ? 60 : envRefresh);
  });

  // Demo mode is activated if explicitly enabled, or if no Channel ID is supplied and demo fallback is allowed
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_DEMO_MODE);
    if (saved !== null) return saved === 'true';
    return !envChannelId && envDemoFallback;
  });

  const [demoPreset, setDemoPresetState] = useState<'greenhouse' | 'orchard' | 'standard_no_npk'>(() => {
    return (localStorage.getItem(STORAGE_DEMO_PRESET) as any) || 'greenhouse';
  });

  const [selectedCropPreset, setSelectedCropPreset] = useState<CropThresholdPreset>(() => {
    const savedId = localStorage.getItem(STORAGE_CROP_PRESET);
    const found = CROP_PRESETS.find(p => p.id === savedId);
    return found || CROP_PRESETS[0];
  });

  const [activeThresholds, setActiveThresholds] = useState<Record<SoilParameterKey, ParameterThreshold>>(() => {
    return { ...selectedCropPreset.thresholds };
  });

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_DARK_MODE);
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Core Data State
  const [records, setRecords] = useState<SoilMeasurementRecord[]>([]);
  const [channelTitle, setChannelTitle] = useState<string>('SoilSense-01 Field Node');
  const [channelDescription, setChannelDescription] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selectedParameterModal, setSelectedParameterModal] = useState<SoilParameterKey | null>(null);
  const [selectedRecordModal, setSelectedRecordModal] = useState<SoilMeasurementRecord | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback((text: string, type: ToastNotification['type'] = 'info') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_DARK_MODE, darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Primary Data Fetch / Load Logic
  const loadData = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    if (isDemoMode) {
      // Simulate slight network latency for realistic feel
      setTimeout(() => {
        const demoRecords = generateRealisticDemoRecords(demoPreset);
        setRecords(demoRecords);
        setChannelTitle(`Demo: SoilSense Test Rig (${demoPreset.replace('_', ' ').toUpperCase()})`);
        setChannelDescription('Demonstration telemetry representing manual button-press uploads.');
        setLastSyncTime(new Date());
        setIsLoading(false);
        setIsRefreshing(false);
      }, isBackground ? 400 : 700);
      return;
    }

    // Live ThingSpeak REST fetch
    if (!channelId) {
      setError('No ThingSpeak Channel ID configured. Configure your credentials in Settings or enable Demo Mode.');
      setRecords([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const result = await fetchThingSpeakFeeds({
        channelId,
        readApiKey,
        results: 150
      });

      if (!result.success) {
        setError(result.error || 'Failed to fetch feeds from ThingSpeak.');
        if (result.isRateLimited) {
          showToast('ThingSpeak rate limit hit (15s cooldown). Will retry shortly.', 'warning');
        }
      } else {
        setRecords(result.records);
        setChannelTitle(result.channelTitle || `ThingSpeak Channel ${channelId}`);
        setChannelDescription(result.channelDescription);
        setLastSyncTime(new Date());
        if (result.records.length === 0) {
          showToast('Channel loaded successfully, but has 0 recorded uploads.', 'info');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected communication failure.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isDemoMode, demoPreset, channelId, readApiKey, showToast]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalMs = Math.max(15, autoRefreshInterval) * 1000;
    const timer = setInterval(() => {
      loadData(true);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, loadData]);

  // Demo Mode Switch
  const toggleDemoMode = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(nextVal);
    localStorage.setItem(STORAGE_DEMO_MODE, nextVal.toString());
    showToast(
      nextVal ? 'Switched to Demo Mode (simulated hardware probe).' : 'Switched to Live ThingSpeak Mode.',
      'info'
    );
  };

  const setDemoPreset = (preset: 'greenhouse' | 'orchard' | 'standard_no_npk') => {
    setDemoPresetState(preset);
    localStorage.setItem(STORAGE_DEMO_PRESET, preset);
  };

  // Simulate Button Press Upload
  const simulateDeviceUpload = () => {
    if (!isDemoMode) {
      showToast('Simulate Button Upload is only active in Demo Mode.', 'warning');
      return;
    }

    const last = records.length > 0 ? records[records.length - 1] : null;
    const hasNPK = demoPreset !== 'standard_no_npk';
    const newRecord = createSimulatedButtonUpload(last, hasNPK);

    setRecords(prev => [...prev, newRecord]);
    setLastSyncTime(new Date());
    showToast(`Physical Button Pressed! Uploaded Sample #${newRecord.entryId} to cloud.`, 'success');
  };

  // Save Settings
  const saveSettings = (newChannelId: string, newApiKey: string, refreshInterval: number) => {
    setChannelId(newChannelId);
    setReadApiKey(newApiKey);
    setAutoRefreshInterval(refreshInterval);

    localStorage.setItem(STORAGE_CHANNEL_ID, newChannelId);
    localStorage.setItem(STORAGE_API_KEY, newApiKey);
    localStorage.setItem(STORAGE_REFRESH_INTERVAL, refreshInterval.toString());

    showToast('Settings saved successfully.', 'success');
  };

  // Crop Presets
  const setCropPresetById = (presetId: string) => {
    const preset = CROP_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedCropPreset(preset);
      setActiveThresholds({ ...preset.thresholds });
      localStorage.setItem(STORAGE_CROP_PRESET, preset.id);
      showToast(`Agronomic profile set to: ${preset.name}`, 'info');
    }
  };

  const updateCustomThreshold = (key: SoilParameterKey, threshold: ParameterThreshold) => {
    setActiveThresholds(prev => ({
      ...prev,
      [key]: threshold
    }));
  };

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  return (
    <SoilSenseContext.Provider
      value={{
        records,
        latestRecord,
        channelTitle,
        channelDescription,
        isLoading,
        isRefreshing,
        lastSyncTime,
        error,
        isDemoMode,
        demoPreset,
        channelId,
        readApiKey,
        autoRefreshInterval,
        selectedCropPreset,
        activeThresholds,
        darkMode,
        selectedParameterModal,
        selectedRecordModal,
        toast,
        refreshData: () => loadData(false),
        toggleDemoMode,
        setDemoPreset,
        simulateDeviceUpload,
        saveSettings,
        setCropPresetById,
        updateCustomThreshold,
        toggleDarkMode,
        openParameterModal: (key: SoilParameterKey) => setSelectedParameterModal(key),
        closeParameterModal: () => setSelectedParameterModal(null),
        openRecordModal: (rec: SoilMeasurementRecord) => setSelectedRecordModal(rec),
        closeRecordModal: () => setSelectedRecordModal(null),
        dismissToast
      }}
    >
      {children}
    </SoilSenseContext.Provider>
  );
};

export const useSoilSense = () => {
  const context = useContext(SoilSenseContext);
  if (!context) {
    throw new Error('useSoilSense must be used within a SoilSenseProvider');
  }
  return context;
};
