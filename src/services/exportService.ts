import { SoilMeasurementRecord, SoilParameterKey } from '../types/thingspeak';

export interface ParameterStats {
  count: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  stdDev: number | null;
}

/**
 * Calculates statistical metrics (min, max, mean, stdDev) for a specific parameter
 */
export function calculateParameterStats(
  records: SoilMeasurementRecord[],
  key: SoilParameterKey
): ParameterStats {
  const validValues = records
    .map(r => r[key])
    .filter((v): v is number => v !== null && !isNaN(v));

  if (validValues.length === 0) {
    return { count: 0, min: null, max: null, avg: null, stdDev: null };
  }

  const count = validValues.length;
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const sum = validValues.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / count;

  // Standard deviation
  const variance = validValues.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    avg: parseFloat(avg.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2))
  };
}

/**
 * Generates and downloads a CSV file containing historical soil test records
 */
export function exportRecordsToCSV(
  records: SoilMeasurementRecord[],
  filenamePrefix: string = 'soilsense-data'
): void {
  if (records.length === 0) {
    alert('No measurement records available to export.');
    return;
  }

  const headers = [
    'Entry ID',
    'UTC Timestamp',
    'Local Time',
    'Soil Moisture (%)',
    'Soil Temperature (°C)',
    'Soil pH',
    'Electrical Conductivity (µS/cm)',
    'Nitrogen (mg/kg)',
    'Phosphorus (mg/kg)',
    'Potassium (mg/kg)',
    'Battery Voltage (V)',
    'Battery Percentage (%)',
    'Plot Tag',
    'Notes'
  ];

  const rows = records.map(record => {
    const localTime = new Date(record.timestamp).toLocaleString();
    return [
      record.entryId,
      `"${record.timestamp}"`,
      `"${localTime}"`,
      record.moisture !== null ? record.moisture : 'N/A',
      record.temperature !== null ? record.temperature : 'N/A',
      record.pH !== null ? record.pH : 'N/A',
      record.ec !== null ? record.ec : 'N/A',
      record.nitrogen !== null ? record.nitrogen : 'N/A',
      record.phosphorus !== null ? record.phosphorus : 'N/A',
      record.potassium !== null ? record.potassium : 'N/A',
      record.batteryVoltage !== null ? record.batteryVoltage : 'N/A',
      record.batteryPercent !== null ? `${record.batteryPercent}%` : 'N/A',
      `"${record.plotTag || ''}"`,
      `"${record.notes || ''}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.setAttribute('download', `${filenamePrefix}-${nowStr}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
