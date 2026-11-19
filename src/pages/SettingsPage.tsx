import React, { useState } from 'react';
import { useSoilSense } from '../context/SoilSenseContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { fetchThingSpeakFeeds } from '../services/thingspeakService';
import { CROP_PRESETS, PARAMETER_CONFIGS } from '../utils/constants';
import { SoilParameterKey } from '../types/thingspeak';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  RotateCcw,
  Key,
  Database,
  Info,
  Clock,
  ShieldAlert,
  Zap
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    channelId,
    readApiKey,
    autoRefreshInterval,
    isDemoMode,
    demoPreset,
    selectedCropPreset,
    activeThresholds,
    saveSettings,
    toggleDemoMode,
    setDemoPreset,
    setCropPresetById,
    updateCustomThreshold,
    simulateDeviceUpload,
    refreshData
  } = useSoilSense();

  const [inputChannelId, setInputChannelId] = useState(channelId);
  const [inputApiKey, setInputApiKey] = useState(readApiKey);
  const [inputRefreshInterval, setInputRefreshInterval] = useState(autoRefreshInterval);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    if (!inputChannelId.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter a Channel ID first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Pinging ThingSpeak REST API...');

    try {
      const res = await fetchThingSpeakFeeds({
        channelId: inputChannelId.trim(),
        readApiKey: inputApiKey.trim(),
        results: 1
      });

      if (res.success) {
        setTestStatus('success');
        setTestMessage(`Connection verified! Channel: "${res.channelTitle}" with ${res.records.length} retrieved record(s).`);
      } else {
        setTestStatus('error');
        setTestMessage(res.error || 'Connection failed.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Network exception.');
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(inputChannelId.trim(), inputApiKey.trim(), inputRefreshInterval);
    refreshData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ThingSpeak API Configuration Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              ThingSpeak Cloud Integration Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure credentials for the channel where your ESP8266 uploads sensor packets
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                ThingSpeak Channel ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1234567"
                value={inputChannelId}
                onChange={e => setInputChannelId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2 text-navy-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on your ThingSpeak Channel overview page.
              </span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Read API Key (Optional for Public channels)
              </label>
              <input
                type="password"
                placeholder="e.g. 16-character alphanumeric key"
                value={inputApiKey}
                onChange={e => setInputApiKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2 text-navy-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required only if your channel privacy is set to Private.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
              Dashboard Polling Interval
            </label>
            <select
              value={inputRefreshInterval}
              onChange={e => setInputRefreshInterval(parseInt(e.target.value, 10))}
              className="w-full sm:w-72 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2 text-navy-900 dark:text-white text-xs"
            >
              <option value={0}>Manual Only (No background poll)</option>
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 60 seconds (Recommended)</option>
              <option value={300}>Every 5 minutes</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              ThingSpeak free accounts enforce a 15-second rate limit.
            </span>
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300'
              }`}
            >
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              {testStatus === 'testing' && <Clock className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />}
              <span>{testMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button type="submit" variant="primary" size="sm">
              Save Configuration
            </Button>
            <Button
              type="button"
              onClick={handleTestConnection}
              variant="outline"
              size="sm"
              loading={testStatus === 'testing'}
            >
              Test Connection
            </Button>
          </div>
        </form>
      </Card>

      {/* Field Mapping Guide Card */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-navy-900 dark:text-white mb-2">
          ThingSpeak Channel Field Mapping Standard
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ensure your ESP8266 Arduino firmware sends fields formatted according to this specification:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field1</div>
            <div className="font-bold text-sky-600">Moisture (%)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field2</div>
            <div className="font-bold text-amber-600">Temp (°C)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field3</div>
            <div className="font-bold text-purple-600">Soil pH</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field4</div>
            <div className="font-bold text-emerald-600">EC (µS/cm)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field5</div>
            <div className="font-bold text-green-600">Nitrogen</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field6</div>
            <div className="font-bold text-amber-600">Phosphorus</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field7</div>
            <div className="font-bold text-rose-600">Potassium</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="text-slate-400 font-sans text-[10px]">field8</div>
            <div className="font-bold text-teal-600">Battery (V)</div>
          </div>
        </div>
      </Card>

      {/* Demonstration & Simulation Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Demonstration & Testing Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test dashboard behavior without physical hardware powered on
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700">
            <div>
              <span className="font-bold text-navy-900 dark:text-white block">
                Enable Demonstration Mode
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Displays realistic spot tests with manual push-button simulator
              </p>
            </div>
            <Button
              type="button"
              onClick={() => toggleDemoMode()}
              variant={isDemoMode ? 'primary' : 'outline'}
              size="sm"
            >
              {isDemoMode ? 'Active (Demo On)' : 'Enable Demo Mode'}
            </Button>
          </div>

          {isDemoMode && (
            <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <label className="block font-semibold text-amber-900 dark:text-amber-200">
                Select Agricultural Test Scenario Preset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'greenhouse',
                    name: 'Greenhouse Polyhouse',
                    desc: 'Balanced fertigation with 7-in-1 NPK sensor'
                  },
                  {
                    id: 'orchard',
                    name: 'Citrus Orchard',
                    desc: 'Acidic profile (pH 5.4) with NPK support'
                  },
                  {
                    id: 'standard_no_npk',
                    name: '4-in-1 Sensor Variant',
                    desc: 'NPK explicitly marked "Not available"'
                  }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDemoPreset(p.id as any)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      demoPreset === p.id
                        ? 'border-brand-500 bg-white dark:bg-navy-900 shadow-xs'
                        : 'border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950'
                    }`}
                  >
                    <div className="font-bold text-navy-900 dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  Simulate physical agronomist pressing device button:
                </span>
                <Button
                  onClick={simulateDeviceUpload}
                  variant="primary"
                  size="sm"
                  icon={<Zap className="w-3.5 h-3.5 fill-current" />}
                >
                  Press Button (Upload Spot Test)
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* User-Defined Agronomic Crop Presets */}
      <Card className="p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              User-Defined Agronomic Threshold Guidelines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize optimal ranges for the Agronomic Health Index and parameter status badges
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
              Select Target Crop Profile:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CROP_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCropPresetById(preset.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    selectedCropPreset.id === preset.id
                      ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/30 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-navy-900 dark:text-white">{preset.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700 text-slate-500 dark:text-slate-400 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              <strong>Agronomic Disclaimer:</strong> Thresholds configured here are user-defined reference guidelines. They do not constitute universal agricultural requirements. Adjust according to local soil tests and crop cultivar recommendations.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
