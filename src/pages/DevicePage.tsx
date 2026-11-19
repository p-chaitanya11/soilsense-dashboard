import React from 'react';
import { useSoilSense } from '../context/SoilSenseContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DEFAULT_DEVICE_METADATA } from '../utils/constants';
import { format } from 'date-fns';
import {
  Cpu,
  Radio,
  Wifi,
  Battery,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Zap,
  ArrowRight,
  Monitor,
  CheckCircle2,
  Clock,
  Layers,
  Server
} from 'lucide-react';

export const DevicePage: React.FC = () => {
  const { latestRecord, records, channelId, isDemoMode, simulateDeviceUpload } = useSoilSense();

  const batteryVolt = latestRecord?.batteryVoltage ?? 11.4;
  const batteryPct = latestRecord?.batteryPercent ?? 75;

  return (
    <div className="space-y-6">
      {/* Device Header Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">
                  {DEFAULT_DEVICE_METADATA.name}
                </h2>
                <Badge status="success">Hardware Ready</Badge>
                {isDemoMode && <Badge status="warning">Demo Probe Simulation</Badge>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Firmware: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{DEFAULT_DEVICE_METADATA.firmwareVersion}</span> · Hardware Rev 1.2
              </p>
            </div>
          </div>

          {/* Action button */}
          {isDemoMode && (
            <Button
              onClick={simulateDeviceUpload}
              variant="primary"
              size="sm"
              icon={<Zap className="w-4 h-4 fill-current" />}
            >
              Simulate Physical Button Press (2s)
            </Button>
          )}
        </div>
      </Card>

      {/* Critical UX Clarification Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4" />
          <span>ThingSpeak Cloud Telemetry vs Live Connection Notice</span>
        </div>
        <p className="leading-relaxed">
          ThingSpeak feed data alone <strong>does not indicate continuous real-time connectivity</strong>.
          In field operation, the ESP8266 turns off its Wi-Fi modem between manual uploads to conserve the 3S Li-ion battery.
          The timestamp below represents the <strong>last manual cloud transmission</strong>, not an always-on heartbeat.
        </p>
      </div>

      {/* Hardware Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Processing & Sensor */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-navy-800 pb-3">
            <Cpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-navy-900 dark:text-white">
              Processing & Sensing Unit
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Microcontroller:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.mcu}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Soil Multi-Sensor:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.sensor}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Bus Communication:</span>
              <span className="font-mono font-medium text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.protocol}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">RS485 Transceiver:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                Automatic Directional TTL-to-RS485
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Local Display:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                0.96″ I2C OLED (SSD1306 128x64)
              </span>
            </div>
          </div>
        </Card>

        {/* Battery & Power Profile */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-navy-800 pb-3">
            <Battery className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-navy-900 dark:text-white">
              Power & 3S Li-ion Battery
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Battery Architecture:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.batterySpecs}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Pack Capacity:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.batteryCapacityMah} mAh
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Latest Voltage:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {latestRecord?.batteryVoltage !== null && latestRecord?.batteryVoltage !== undefined
                  ? `${latestRecord.batteryVoltage} V (${batteryPct}%)`
                  : '11.1V (Nominal)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Idle / Sleep Draw:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                ~18 mA (Wi-Fi OFF)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Transmitting Draw:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                ~140 mA (Wi-Fi burst ~4s)
              </span>
            </div>
          </div>
        </Card>

        {/* Connectivity & Fallback */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-navy-800 pb-3">
            <Radio className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-navy-900 dark:text-white">
              Cloud & Network Fallback
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Cloud Service:</span>
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                ThingSpeak Channel Feeds
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Primary Wi-Fi:</span>
              <span className="font-mono font-medium text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.primarySsid}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Hotspot Fallback:</span>
              <span className="font-mono font-medium text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.fallbackSsid}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-navy-800/50">
              <span className="text-slate-500">Trigger Mechanism:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                Push Button (~2s hold)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Active Channel ID:</span>
              <span className="font-mono text-navy-900 dark:text-slate-200">
                {channelId || 'Demo Channel'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Step-by-Step Interactive Push-to-Cloud Hardware Flow Diagram */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-navy-900 dark:text-white mb-1">
          Hardware Operational Workflow: Manual Push-to-Cloud
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          How SoilSense achieves weeks of field battery life without sacrificing immediate on-site readings
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 relative">
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="text-sm font-semibold text-navy-900 dark:text-white mb-1">
              Continuous Local Sensing
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ESP8266 queries the JXBS-3001-TR probe via RS485 Modbus RTU at 9600 baud. Real-time soil moisture, temp, pH, and EC are drawn locally on the 0.96″ OLED.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Wi-Fi Radio: OFF</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-800/40 bg-brand-50/30 dark:bg-brand-950/20 relative">
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="text-sm font-semibold text-navy-900 dark:text-white mb-1">
              Physical Button Trigger
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Agronomist places probe in target spot and presses push button for 2 seconds. ESP8266 powers up Wi-Fi, attempts Primary network, or auto-falls back to Mobile Hotspot.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-brand-600">
              <Zap className="w-3.5 h-3.5" />
              <span>Transmission Window: ~4-6 seconds</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 relative">
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="text-sm font-semibold text-navy-900 dark:text-white mb-1">
              Upload & Immediate Sleep
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A single timestamped HTTP GET/POST payload is delivered to ThingSpeak Channel. Upon HTTP 200, the ESP8266 immediately severs Wi-Fi connection and returns to local OLED mode.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-sky-600">
              <Clock className="w-3.5 h-3.5" />
              <span>Battery conserved for next test</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
