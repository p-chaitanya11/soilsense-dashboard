import { ParameterConfig, CropThresholdPreset, DeviceMetadata, SoilParameterKey, AgronomicStatus, ParameterThreshold } from '../types/thingspeak';

export const DEFAULT_DEVICE_METADATA: DeviceMetadata = {
  name: 'SoilSense-01',
  mcu: 'ESP8266 NodeMCU (30-pin, Type-C)',
  sensor: 'JXBS-3001-TR RS485 Soil Multi-Sensor',
  protocol: 'Modbus RTU over RS485 (9600-8-N-1)',
  baudRate: 9600,
  cloudPlatform: 'ThingSpeak Channel Feeds REST API',
  batterySpecs: '11.1V 3S Li-ion (12.6V Peak, 9.6V Cut-off)',
  batteryCapacityMah: 2000,
  triggerMethod: 'Physical Push Button (Hold ~2s for cloud transmission)',
  primarySsid: 'FarmHQ_Wi-Fi_2.4G',
  fallbackSsid: 'Agronomist_Mobile_Hotspot',
  firmwareVersion: 'SoilSense-FW-v1.4.2'
};

export const PARAMETER_CONFIGS: Record<SoilParameterKey, ParameterConfig> = {
  moisture: {
    key: 'moisture',
    label: 'Soil Moisture',
    unit: '%',
    thingSpeakField: 'field1',
    description: 'Volumetric water content of the soil profile.',
    sensorRequirement: 'Standard JXBS-3001-TR Dielectric Permittivity',
    decimals: 1,
    color: '#0284C7', // Sky Blue
    darkColor: '#38BDF8',
    defaultThreshold: {
      minOptimal: 25.0,
      maxOptimal: 45.0,
      warningLow: 15.0,
      warningHigh: 60.0
    }
  },
  temperature: {
    key: 'temperature',
    label: 'Soil Temperature',
    unit: '°C',
    thingSpeakField: 'field2',
    description: 'Sub-surface root zone thermal measurement.',
    sensorRequirement: 'Standard JXBS-3001-TR Platinum RTD / Thermistor',
    decimals: 1,
    color: '#F97316', // Orange
    darkColor: '#FB923C',
    defaultThreshold: {
      minOptimal: 18.0,
      maxOptimal: 26.0,
      warningLow: 12.0,
      warningHigh: 32.0
    }
  },
  pH: {
    key: 'pH',
    label: 'Soil pH',
    unit: 'pH',
    thingSpeakField: 'field3',
    description: 'Soil acidity or alkalinity affecting nutrient availability.',
    sensorRequirement: 'Standard JXBS-3001-TR pH Electrode Pin',
    decimals: 2,
    color: '#8B5CF6', // Purple
    darkColor: '#A78BFA',
    defaultThreshold: {
      minOptimal: 6.0,
      maxOptimal: 7.2,
      warningLow: 5.2,
      warningHigh: 8.0
    }
  },
  ec: {
    key: 'ec',
    label: 'Electrical Conductivity',
    unit: 'µS/cm',
    thingSpeakField: 'field4',
    description: 'Indicator of dissolved mineral salts and soil salinity.',
    sensorRequirement: 'Standard JXBS-3001-TR Dual Electrode Conductometry',
    decimals: 0,
    color: '#059669', // Emerald
    darkColor: '#34D399',
    defaultThreshold: {
      minOptimal: 400,
      maxOptimal: 1400,
      warningLow: 200,
      warningHigh: 2200
    }
  },
  nitrogen: {
    key: 'nitrogen',
    label: 'Nitrogen (N)',
    unit: 'mg/kg',
    thingSpeakField: 'field5',
    description: 'Primary macronutrient essential for vegetative leaf development.',
    sensorRequirement: 'Optional JXBS-3001 7-in-1 NPK Optical/Electrochemical Variant',
    decimals: 0,
    color: '#16A34A', // Green
    darkColor: '#4ADE80',
    defaultThreshold: {
      minOptimal: 50,
      maxOptimal: 120,
      warningLow: 30,
      warningHigh: 180
    }
  },
  phosphorus: {
    key: 'phosphorus',
    label: 'Phosphorus (P)',
    unit: 'mg/kg',
    thingSpeakField: 'field6',
    description: 'Macronutrient vital for root establishment, flowering, and seeds.',
    sensorRequirement: 'Optional JXBS-3001 7-in-1 NPK Optical/Electrochemical Variant',
    decimals: 0,
    color: '#D97706', // Amber
    darkColor: '#FBBF24',
    defaultThreshold: {
      minOptimal: 30,
      maxOptimal: 80,
      warningLow: 15,
      warningHigh: 120
    }
  },
  potassium: {
    key: 'potassium',
    label: 'Potassium (K)',
    unit: 'mg/kg',
    thingSpeakField: 'field7',
    description: 'Macronutrient regulating water retention, disease resistance, and fruit vigor.',
    sensorRequirement: 'Optional JXBS-3001 7-in-1 NPK Optical/Electrochemical Variant',
    decimals: 0,
    color: '#E11D48', // Rose
    darkColor: '#FB7185',
    defaultThreshold: {
      minOptimal: 100,
      maxOptimal: 220,
      warningLow: 60,
      warningHigh: 300
    }
  },
  batteryVoltage: {
    key: 'batteryVoltage',
    label: 'Battery Voltage',
    unit: 'V',
    thingSpeakField: 'field8',
    description: 'Portable unit 3S 11.1V Li-ion pack telemetry via ESP8266 ADC divider.',
    sensorRequirement: 'ESP8266 A0 Voltage Divider (100k/22k resistor network)',
    decimals: 2,
    color: '#0D9488', // Teal
    darkColor: '#2DD4BF',
    defaultThreshold: {
      minOptimal: 11.1,
      maxOptimal: 12.6,
      warningLow: 10.2,
      warningHigh: 12.7
    }
  }
};

export const CROP_PRESETS: CropThresholdPreset[] = [
  {
    id: 'general-loam',
    name: 'General Agricultural Loam',
    description: 'Balanced baseline for standard pasture, general crops, and fertile loamy soils.',
    thresholds: {
      moisture: { minOptimal: 25.0, maxOptimal: 45.0, warningLow: 15.0, warningHigh: 55.0 },
      temperature: { minOptimal: 18.0, maxOptimal: 26.0, warningLow: 12.0, warningHigh: 32.0 },
      pH: { minOptimal: 6.2, maxOptimal: 7.2, warningLow: 5.5, warningHigh: 8.0 },
      ec: { minOptimal: 400, maxOptimal: 1200, warningLow: 200, warningHigh: 2000 },
      nitrogen: { minOptimal: 50, maxOptimal: 120, warningLow: 30, warningHigh: 180 },
      phosphorus: { minOptimal: 30, maxOptimal: 80, warningLow: 15, warningHigh: 120 },
      potassium: { minOptimal: 100, maxOptimal: 220, warningLow: 60, warningHigh: 300 },
      batteryVoltage: { minOptimal: 11.1, maxOptimal: 12.6, warningLow: 10.2, warningHigh: 12.7 }
    }
  },
  {
    id: 'greenhouse-veggies',
    name: 'Greenhouse Vegetables (Tomato & Pepper)',
    description: 'High nutrient fertigation profile with tightly regulated moisture and pH 6.0-6.8.',
    thresholds: {
      moisture: { minOptimal: 35.0, maxOptimal: 55.0, warningLow: 25.0, warningHigh: 65.0 },
      temperature: { minOptimal: 20.0, maxOptimal: 27.0, warningLow: 15.0, warningHigh: 33.0 },
      pH: { minOptimal: 6.0, maxOptimal: 6.8, warningLow: 5.5, warningHigh: 7.5 },
      ec: { minOptimal: 800, maxOptimal: 1800, warningLow: 400, warningHigh: 2500 },
      nitrogen: { minOptimal: 80, maxOptimal: 160, warningLow: 50, warningHigh: 220 },
      phosphorus: { minOptimal: 40, maxOptimal: 100, warningLow: 25, warningHigh: 140 },
      potassium: { minOptimal: 140, maxOptimal: 280, warningLow: 80, warningHigh: 350 },
      batteryVoltage: { minOptimal: 11.1, maxOptimal: 12.6, warningLow: 10.2, warningHigh: 12.7 }
    }
  },
  {
    id: 'acid-berries',
    name: 'Acid-Loving Crops (Blueberries, Tea)',
    description: 'Low-pH acidic soil requirements (pH 4.8 - 5.8) with moderate EC sensitivity.',
    thresholds: {
      moisture: { minOptimal: 30.0, maxOptimal: 50.0, warningLow: 20.0, warningHigh: 60.0 },
      temperature: { minOptimal: 16.0, maxOptimal: 24.0, warningLow: 10.0, warningHigh: 30.0 },
      pH: { minOptimal: 4.8, maxOptimal: 5.6, warningLow: 4.2, warningHigh: 6.2 },
      ec: { minOptimal: 200, maxOptimal: 800, warningLow: 100, warningHigh: 1200 },
      nitrogen: { minOptimal: 40, maxOptimal: 90, warningLow: 25, warningHigh: 140 },
      phosphorus: { minOptimal: 25, maxOptimal: 60, warningLow: 12, warningHigh: 90 },
      potassium: { minOptimal: 80, maxOptimal: 180, warningLow: 50, warningHigh: 240 },
      batteryVoltage: { minOptimal: 11.1, maxOptimal: 12.6, warningLow: 10.2, warningHigh: 12.7 }
    }
  }
];

/**
 * Calculates battery percentage for a 3S Li-ion battery pack (3 series cells):
 * 12.6V = 100% (4.2V/cell)
 * 12.0V = 80%
 * 11.4V = 55%
 * 11.1V = 40% (nominal 3.7V/cell)
 * 10.5V = 15%
 * 9.6V  = 0% (3.2V/cell safe cutoff)
 */
export function calculate3SBatteryPercentage(voltage: number | null): number | null {
  if (voltage === null || isNaN(voltage) || voltage <= 0) return null;
  if (voltage >= 12.6) return 100;
  if (voltage <= 9.6) return 0;
  
  // Polynomial approximation of 3S Li-ion discharge curve
  if (voltage >= 12.2) {
    return Math.round(85 + (voltage - 12.2) / 0.4 * 15);
  } else if (voltage >= 11.5) {
    return Math.round(55 + (voltage - 11.5) / 0.7 * 30);
  } else if (voltage >= 10.8) {
    return Math.round(25 + (voltage - 10.8) / 0.7 * 30);
  } else {
    return Math.round((voltage - 9.6) / 1.2 * 25);
  }
}

/**
 * Evaluates agronomic status against configured thresholds
 */
export function evaluateAgronomicStatus(
  value: number | null,
  threshold: ParameterThreshold
): AgronomicStatus {
  if (value === null || isNaN(value)) return 'unavailable';
  if (value < threshold.warningLow) return 'critical-low';
  if (value < threshold.minOptimal) return 'low';
  if (value > threshold.warningHigh) return 'critical-high';
  if (value > threshold.maxOptimal) return 'high';
  return 'optimal';
}
