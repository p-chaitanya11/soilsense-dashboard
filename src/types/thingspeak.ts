/**
 * ThingSpeak REST API and SoilSense Domain Types
 */

export interface ThingSpeakChannel {
  id: number;
  name: string;
  description: string;
  latitude?: string;
  longitude?: string;
  field1?: string; // Soil Moisture (%)
  field2?: string; // Soil Temperature (°C)
  field3?: string; // Soil pH
  field4?: string; // Electrical Conductivity (µS/cm)
  field5?: string; // Nitrogen (mg/kg)
  field6?: string; // Phosphorus (mg/kg)
  field7?: string; // Potassium (mg/kg)
  field8?: string; // Battery Voltage (V)
  created_at: string;
  updated_at: string;
  last_entry_id: number;
}

export interface ThingSpeakFeedEntry {
  created_at: string;
  entry_id: number;
  field1: string | null; // Moisture %
  field2: string | null; // Temp °C
  field3: string | null; // pH
  field4: string | null; // EC µS/cm
  field5: string | null; // N mg/kg
  field6: string | null; // P mg/kg
  field7: string | null; // K mg/kg
  field8: string | null; // Battery V
}

export interface ThingSpeakApiResponse {
  channel: ThingSpeakChannel;
  feeds: ThingSpeakFeedEntry[];
}

/**
 * Cleanly parsed measurement record with numeric types,
 * null-coalesced unavailable fields, and timestamps.
 */
export interface SoilMeasurementRecord {
  entryId: number;
  timestamp: string; // ISO 8601
  date: Date;
  moisture: number | null;        // % (0 - 100)
  temperature: number | null;     // °C
  pH: number | null;              // 0 - 14
  ec: number | null;              // µS/cm
  nitrogen: number | null;        // mg/kg
  phosphorus: number | null;      // mg/kg
  potassium: number | null;        // mg/kg
  batteryVoltage: number | null;  // V (3S Li-ion nominal 11.1V, max 12.6V, cut-off 9.6V)
  batteryPercent: number | null;  // % (0 - 100)
  plotTag?: string;               // Optional agricultural zone or field tag
  notes?: string;
}

export type SoilParameterKey = 
  | 'moisture' 
  | 'temperature' 
  | 'pH' 
  | 'ec' 
  | 'nitrogen' 
  | 'phosphorus' 
  | 'potassium' 
  | 'batteryVoltage';

export interface ParameterThreshold {
  minOptimal: number;
  maxOptimal: number;
  warningLow: number;
  warningHigh: number;
}

export type AgronomicStatus = 'optimal' | 'low' | 'high' | 'critical-low' | 'critical-high' | 'unavailable';

export interface ParameterConfig {
  key: SoilParameterKey;
  label: string;
  unit: string;
  thingSpeakField: string;
  description: string;
  sensorRequirement: string;
  decimals: number;
  color: string; // Hex or Tailwind color
  darkColor: string;
  defaultThreshold: ParameterThreshold;
}

export interface CropThresholdPreset {
  id: string;
  name: string;
  description: string;
  thresholds: Record<SoilParameterKey, ParameterThreshold>;
}

export interface DeviceMetadata {
  name: string;
  mcu: string;
  sensor: string;
  protocol: string;
  baudRate: number;
  cloudPlatform: string;
  batterySpecs: string;
  batteryCapacityMah: number;
  triggerMethod: string;
  primarySsid: string;
  fallbackSsid: string;
  firmwareVersion: string;
}
