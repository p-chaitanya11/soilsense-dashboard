import { SoilMeasurementRecord } from '../types/thingspeak';
import { calculate3SBatteryPercentage } from '../utils/constants';

/**
 * Realistic demonstration datasets for testing when no physical device 
 * or live ThingSpeak channel is connected.
 * 
 * IMPORTANT:
 * As per product guidelines, demo mode is clearly labeled with an amber banner
 * to prevent confusing demo telemetry with genuine hardware uploads.
 */

export interface DemoDatasetPreset {
  id: string;
  name: string;
  description: string;
  hasNPK: boolean;
  hasBattery: boolean;
  records: SoilMeasurementRecord[];
}

export function generateRealisticDemoRecords(
  presetId: 'greenhouse' | 'orchard' | 'standard_no_npk' = 'greenhouse'
): SoilMeasurementRecord[] {
  const records: SoilMeasurementRecord[] = [];
  const now = new Date();
  
  // Create 36 sample records simulating manual spot-tests taken over the past 48 hours
  const sampleCount = 32;

  for (let i = 0; i < sampleCount; i++) {
    // Space out uploads irregularly (e.g. agronomist walks plot and presses button every ~40 - 90 minutes during day)
    const hoursAgo = (sampleCount - 1 - i) * 1.5;
    const recordDate = new Date(now.getTime() - hoursAgo * 3600 * 1000);
    
    // Simulate natural diurnal temperature variation
    const hour = recordDate.getHours();
    const tempDiurnal = Math.sin((hour - 8) * (Math.PI / 12)) * 4.2;

    let moisture: number | null = 34.5;
    let temp: number | null = 22.4 + tempDiurnal;
    let pH: number | null = 6.45;
    let ec: number | null = 920;
    let nitrogen: number | null = 78;
    let phosphorus: number | null = 45;
    let potassium: number | null = 165;
    let batteryVoltage: number | null = 11.85 - (sampleCount - i) * 0.015; // Slow discharge

    if (presetId === 'greenhouse') {
      // Tomato Polyhouse: Good moisture, slight fertilizer pulse at mid-day
      moisture = Math.max(22, Math.min(52, 38.0 + Math.sin(i * 0.4) * 6.5 + (Math.random() * 2 - 1)));
      temp = parseFloat((23.5 + tempDiurnal + (Math.random() * 1.2 - 0.6)).toFixed(1));
      pH = parseFloat((6.35 + Math.sin(i * 0.25) * 0.2 + (Math.random() * 0.1 - 0.05)).toFixed(2));
      ec = Math.round(950 + Math.cos(i * 0.3) * 180 + (Math.random() * 40 - 20));
      nitrogen = Math.round(82 + Math.sin(i * 0.3) * 14 + (Math.random() * 6 - 3));
      phosphorus = Math.round(48 + Math.cos(i * 0.3) * 8 + (Math.random() * 4 - 2));
      potassium = Math.round(180 + Math.sin(i * 0.2) * 22 + (Math.random() * 10 - 5));
    } else if (presetId === 'orchard') {
      // Citrus Orchard: Acidic soil, slightly lower moisture
      moisture = Math.max(18, Math.min(38, 26.2 + Math.cos(i * 0.3) * 4.2 + (Math.random() * 1.5 - 0.75)));
      temp = parseFloat((21.0 + tempDiurnal * 1.2 + (Math.random() * 1.0 - 0.5)).toFixed(1));
      pH = parseFloat((5.45 + Math.sin(i * 0.2) * 0.15 + (Math.random() * 0.08 - 0.04)).toFixed(2));
      ec = Math.round(620 + Math.sin(i * 0.3) * 90 + (Math.random() * 30 - 15));
      nitrogen = Math.round(55 + (Math.random() * 8 - 4));
      phosphorus = Math.round(32 + (Math.random() * 6 - 3));
      potassium = Math.round(135 + (Math.random() * 12 - 6));
    } else if (presetId === 'standard_no_npk') {
      // 4-in-1 Sensor Variant (Only Moisture, Temp, pH, EC) -> NPK is NULL!
      moisture = Math.max(20, Math.min(48, 31.4 + Math.sin(i * 0.35) * 5.0));
      temp = parseFloat((22.8 + tempDiurnal).toFixed(1));
      pH = parseFloat((6.8 + Math.cos(i * 0.2) * 0.25).toFixed(2));
      ec = Math.round(810 + Math.sin(i * 0.4) * 120);
      nitrogen = null;    // Sensor firmware does not support NPK
      phosphorus = null;  // Sensor firmware does not support NPK
      potassium = null;   // Sensor firmware does not support NPK
    }

    const bPercent = calculate3SBatteryPercentage(batteryVoltage);

    records.push({
      entryId: 1000 + i + 1,
      timestamp: recordDate.toISOString(),
      date: recordDate,
      moisture: moisture !== null ? parseFloat(moisture.toFixed(1)) : null,
      temperature: temp,
      pH: pH,
      ec: ec,
      nitrogen: nitrogen,
      phosphorus: phosphorus,
      potassium: potassium,
      batteryVoltage: batteryVoltage !== null ? parseFloat(batteryVoltage.toFixed(2)) : null,
      batteryPercent: bPercent,
      plotTag: `Plot ${String.fromCharCode(65 + (i % 3))} - Point #${(i % 5) + 1}`,
      notes: i === sampleCount - 1 ? 'Latest spot sample uploaded via manual button press' : undefined
    });
  }

  return records;
}

/**
 * Creates a brand new simulated upload record as if the agronomist 
 * just held the push button for 2 seconds in the field.
 */
export function createSimulatedButtonUpload(
  lastRecord: SoilMeasurementRecord | null,
  hasNPK: boolean = true
): SoilMeasurementRecord {
  const now = new Date();
  const nextId = (lastRecord?.entryId || 1000) + 1;

  // Small random walk from previous reading
  const prevMoist = lastRecord?.moisture ?? 35.0;
  const prevTemp = lastRecord?.temperature ?? 23.0;
  const prevPH = lastRecord?.pH ?? 6.5;
  const prevEC = lastRecord?.ec ?? 950;
  const prevVolt = lastRecord?.batteryVoltage ?? 11.6;

  const moisture = Math.max(10, Math.min(80, parseFloat((prevMoist + (Math.random() * 2.4 - 1.1)).toFixed(1))));
  const temperature = parseFloat((prevTemp + (Math.random() * 1.0 - 0.5)).toFixed(1));
  const pH = parseFloat((prevPH + (Math.random() * 0.16 - 0.08)).toFixed(2));
  const ec = Math.round(prevEC + (Math.random() * 40 - 20));
  const batteryVoltage = parseFloat(Math.max(9.6, prevVolt - 0.01).toFixed(2));

  return {
    entryId: nextId,
    timestamp: now.toISOString(),
    date: now,
    moisture,
    temperature,
    pH,
    ec,
    nitrogen: hasNPK ? Math.round((lastRecord?.nitrogen ?? 80) + (Math.random() * 6 - 3)) : null,
    phosphorus: hasNPK ? Math.round((lastRecord?.phosphorus ?? 45) + (Math.random() * 4 - 2)) : null,
    potassium: hasNPK ? Math.round((lastRecord?.potassium ?? 170) + (Math.random() * 8 - 4)) : null,
    batteryVoltage,
    batteryPercent: calculate3SBatteryPercentage(batteryVoltage),
    plotTag: 'Zone 1 - Manual Probe Test',
    notes: 'Triggered via simulated push button'
  };
}
