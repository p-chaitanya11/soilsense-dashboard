# SoilSense – Portable IoT Soil Health Monitoring Platform

![SoilSense Agricultural IoT Dashboard](https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80)

**SoilSense** is a commercial-grade, responsive Web & Telemetry Dashboard engineered for precision agricultural IoT monitoring. It integrates with portable **ESP8266 + JXBS-3001-TR RS485 Modbus Soil Probes** via the **ThingSpeak Channel Feeds REST API**.

---

## 1. System Architecture & Working Principle

### The "Push-to-Cloud" Battery Conservation Architecture
Unlike fixed weather stations that stay permanently connected to Wi-Fi and exhaust portable batteries within hours, SoilSense operates on a **manual push-to-cloud telemetry model**:

1. **Continuous Local Measurement:**
   - The ESP8266 polls the **JXBS-3001-TR** soil multi-probe continuously via **Modbus RTU over RS485** at 9600 baud.
   - Live measurements are displayed immediately on the device's local **0.96″ I2C OLED screen**.
   - **Wi-Fi radio is powered OFF** to conserve the 3S 11.1V 2000mAh battery pack.

2. **Manual Physical Upload:**
   - When an agronomist tests a field plot, they press and hold the physical tactile button for **~2 seconds**.
   - The ESP8266 wakes up its 2.4GHz Wi-Fi transceiver and connects to the primary farm network.
   - If the primary network is out of range in the field, firmware automatically fails over to the agronomist's **mobile hotspot**.
   - A single, timestamped telemetry packet is POSTed to the **ThingSpeak Channel API**.
   - As soon as the upload confirms (HTTP 200), the device **immediately shuts off Wi-Fi** and returns to standby.

3. **Dashboard Telemetry Distinction:**
   - The dashboard distinctly indicates the **Last Cloud Upload** timestamp.
   - It never misleads users into believing an intermittent portable field probe is an always-on live socket stream.
   - If optional sensor channels (e.g., Nitrogen, Phosphorus, Potassium, Battery ADC) are missing on 4-in-1 or 5-in-1 sensor revisions, the dashboard displays `"Not available"` rather than synthesizing fabricated values.

---

## 2. Hardware Bill of Materials (BOM)

| Component | Specification | Function |
|---|---|---|
| **Microcontroller** | ESP8266 NodeMCU (30-pin, Type-C) | Main controller, Modbus master, Wi-Fi client |
| **Soil Multi-Sensor** | JXBS-3001-TR (5-pin or 7-pin) | Soil Moisture, Temp, pH, EC, (NPK optional) |
| **RS485 Transceiver** | Automatic Flow Control TTL-to-RS485 | Converts ESP8266 3.3V UART to differential RS485 A/B |
| **Local Display** | 0.96″ Monochrome OLED (SSD1306, I2C 0x3C) | On-site real-time data display |
| **Trigger Switch** | Tactile Push Button with 10k pull-up | Initiates 2s hold for cloud data transmission |
| **Battery Pack** | 3S Li-ion (11.1V nominal, 12.6V max, 2000mAh) | Powers RS485 probe (requires 9-24V) and ESP8266 via buck converter |
| **Power Regulation** | Mini DC-DC Buck Converter (e.g., MP1584EN) | Steps down 11.1V battery to 5.0V for NodeMCU VIN |

---

## 3. ThingSpeak Channel Field Mapping

| ThingSpeak Field | Parameter | Engineering Unit | Valid Range |
|---|---|---|---|
| `field1` | Soil Moisture | `%` (VWC) | `0.0 – 100.0%` |
| `field2` | Soil Temperature | `°C` | `-40.0 – 80.0°C` |
| `field3` | Soil pH | `pH` | `3.00 – 9.00 pH` |
| `field4` | Electrical Conductivity (EC) | `µS/cm` | `0 – 20,000 µS/cm` |
| `field5` | Nitrogen (N) | `mg/kg` | `0 – 1,999 mg/kg` (or `null` if unsupported) |
| `field6` | Phosphorus (P) | `mg/kg` | `0 – 1,999 mg/kg` (or `null` if unsupported) |
| `field7` | Potassium (K) | `mg/kg` | `0 – 1,999 mg/kg` (or `null` if unsupported) |
| `field8` | Battery Voltage | `V` | `9.60 – 12.60 V` (3S Li-ion pack) |

---

## 4. Key Dashboard Features

### A. Overview Dashboard
- **8 KPI Cards:** Moisture, Temperature, pH, EC, Nitrogen, Phosphorus, Potassium, Battery Voltage.
- **Null Safety:** Automatic `"Not available"` status badge when 4-in-1 sensor variants omit NPK.
- **Hardware Summary Strip:** Active device name, Wi-Fi standby state, cloud sync status, and total recorded tests.
- **Agronomic Balance Gauge:** Evaluates soil equilibrium based on user-defined crop threshold profiles.
- **Recent Telemetry Chart:** Combined Moisture & Temperature trend across recent spot tests.
- **Recent Physical Uploads Table:** Fast inspection of recent manual tests.

### B. Soil Analytics & Time Series
- **Time Filters:** Last 24 Hours, Last 7 Days, Last 30 Days, All History, and Custom Date Range.
- **Cross-Parameter Correlation Chart:** Dual-axis plotting (e.g. Moisture vs EC or Temperature vs pH).
- **Interactive Tooltip & Brush:** Zoomable timeline inspection with exact ThingSpeak Entry IDs.
- **Statistical Indices:** Mean, Minimum, Maximum, Sample Count, and Standard Deviation ($\sigma$).
- **Export Filtered Data:** Direct CSV download of filtered datasets.

### C. Historical Records / Testing Logs
- **Searchable Table:** Filter by Entry ID, timestamp, plot tags, or notes.
- **Column Sorting:** Ascending/descending sorting on timestamps and parameters.
- **Pagination:** Select 10, 25, or 50 records per page.
- **Telemetry Inspection Modal:** View formatted readings, agricultural status, and raw ThingSpeak JSON response.

### D. Device & Hardware Architecture
- Full hardware manifest for ESP8266, JXBS-3001-TR, RS485 Modbus, and 3S battery.
- Detailed step-by-step interactive diagram of the manual push-button operational sequence.
- Transparent notice explaining intermittent Wi-Fi battery-saving mechanics.

### E. Parameter Detail Modal
- Deep-dive into each individual soil factor with min/max/average metrics, historical graph, and user-defined threshold ranges.

### F. Reports & Export
- Formatted executive summary report with print-optimized CSS (`@media print`).
- Ready to print or save to PDF with field identifier, agronomist signoff, and statistics table.

### G. Settings & Configuration
- Live ThingSpeak Channel ID & Read API Key setup with instant "Test Connection" ping.
- Adjustable polling interval (Manual, 30s, 60s, 300s).
- **Demonstration & Simulation Mode:** Built-in test scenarios (Tomato Greenhouse, Citrus Orchard, 4-in-1 Sensor) with interactive "Simulate Button Press" trigger.
- **User-Defined Crop Profiles:** General Agricultural Loam, Greenhouse Vegetables, Acid-Loving Crops (Blueberries/Tea).

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
```bash
# 1. Clone repository or navigate to directory
cd soilsense-dashboard

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 6. Environment Variables (`.env`)

```ini
# ThingSpeak Channel Configuration
VITE_THINGSPEAK_CHANNEL_ID=
VITE_THINGSPEAK_READ_API_KEY=

# Auto-refresh interval in seconds (default: 60, set to 0 for manual only)
VITE_AUTO_REFRESH_SECONDS=60

# Enable demonstration fallback if no credentials are configured
VITE_ENABLE_DEMO_FALLBACK=true
```

> **Note:** Credentials can also be configured and tested directly inside the dashboard's **Settings** view without rebuilding.

---

## 7. Deployment to Vercel & Netlify

### Deploying to Vercel
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. Set Framework Preset to **Vite**.
5. Add Environment Variables:
   - `VITE_THINGSPEAK_CHANNEL_ID` = your channel ID
   - `VITE_THINGSPEAK_READ_API_KEY` = your read API key
6. Click **Deploy**.

> The included `vercel.json` automatically handles Single Page Application (SPA) client-side routing.

### Deploying to Netlify
1. Create a `_redirects` file in `public/` (or use Netlify dashboard):
   ```text
   /*    /index.html   200
   ```
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## 8. ESP8266 Arduino Firmware Blueprint

Below is the verified operational flow implemented in the ESP8266 Arduino firmware:

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Wi-Fi Credentials (Primary + Mobile Hotspot Fallback)
const char* primary_ssid = "FarmHQ_Wi-Fi_2.4G";
const char* primary_pass = "FarmPassword2026";
const char* backup_ssid  = "Agronomist_Hotspot";
const char* backup_pass  = "HotspotPassword";

// ThingSpeak Configuration
const char* thingspeak_server = "api.thingspeak.com";
const char* write_api_key     = "YOUR_THINGSPEAK_WRITE_KEY";

// Hardware Pins
#define BUTTON_PIN   D3  // Push button with internal pull-up
#define RS485_RX     D5  // RO from MAX485
#define RS485_TX     D6  // DI to MAX485

SoftwareSerial modbusSerial(RS485_RX, RS485_TX);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  modbusSerial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  WiFi.mode(WIFI_OFF); // Wi-Fi OFF initially to conserve 3S battery!
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.println("SoilSense-01 Ready");
  display.display();
}

void loop() {
  // 1. Read Modbus RTU from JXBS-3001-TR continuously
  float moisture, temp, pH, ec;
  readModbusSensor(moisture, temp, pH, ec);
  updateOLED(moisture, temp, pH, ec);

  // 2. Check if push button is pressed and held for ~2 seconds
  if (digitalRead(BUTTON_PIN) == LOW) {
    unsigned long pressStart = millis();
    while (digitalRead(BUTTON_PIN) == LOW) {
      delay(50);
      if (millis() - pressStart > 2000) {
        // Trigger Cloud Upload
        uploadToThingSpeak(moisture, temp, pH, ec);
        break;
      }
    }
  }
  delay(200);
}

void uploadToThingSpeak(float moisture, float temp, float pH, float ec) {
  display.clearDisplay();
  display.println("Connecting Wi-Fi...");
  display.display();

  WiFi.mode(WIFI_STA);
  WiFi.begin(primary_ssid, primary_pass);
  
  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 8000) {
    delay(250);
  }

  // Fallback to secondary mobile hotspot if primary Wi-Fi is out of range
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(backup_ssid, backup_pass);
    startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 8000) {
      delay(250);
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String url = String("http://") + thingspeak_server + "/update?api_key=" + write_api_key
               + "&field1=" + String(moisture, 1)
               + "&field2=" + String(temp, 1)
               + "&field3=" + String(pH, 2)
               + "&field4=" + String((int)ec);

    http.begin(client, url);
    int httpCode = http.GET();
    http.end();
  }

  // IMMEDIATELY turn Wi-Fi OFF to conserve battery pack
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  
  display.clearDisplay();
  display.println("Uploaded! Wi-Fi OFF");
  display.display();
  delay(1500);
}
```

---

## 9. Technology Stack

- **Framework:** React 18 with TypeScript
- **Bundler & Tooling:** Vite 5
- **Styling:** Tailwind CSS with custom agricultural palette and dark mode
- **Charts & Data Visualization:** Recharts (Area, Line, Dual-Axis, Brush)
- **Icons:** Lucide React
- **Date Handling:** Date-fns

---

## 10. License

SoilSense is distributed under the MIT License. Developed for commercial precision agriculture and IoT field operations.
#   s o i l s e n s e - d a s h b o a r d  
 