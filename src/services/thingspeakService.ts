import {
  ThingSpeakApiResponse,
  ThingSpeakFeedEntry,
  SoilMeasurementRecord
} from '../types/thingspeak';
import { calculate3SBatteryPercentage } from '../utils/constants';

export interface FetchFeedsOptions {
  channelId: string;
  readApiKey?: string;
  results?: number;
  startDate?: string; // YYYY-MM-DD%20HH:NN:SS
  endDate?: string;
}

export interface FetchFeedsResult {
  success: boolean;
  channelTitle?: string;
  channelDescription?: string;
  records: SoilMeasurementRecord[];
  rawResponse?: ThingSpeakApiResponse;
  error?: string;
  statusCode?: number;
  isRateLimited?: boolean;
}

/**
 * Safely parse a numeric field from ThingSpeak string feed.
 * Returns null if empty string, null, undefined, "null", or NaN.
 */
export function parseFeedNumber(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const trimmed = String(val).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed === 'nan') return null;
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return null;
  // If sensor firmware sends error code -999 or -1 for unavailable sensors:
  if (parsed === -999 || parsed === -99) return null;
  return parsed;
}

/**
 * Transforms raw ThingSpeak feed entry into a typed SoilMeasurementRecord
 */
export function transformFeedEntry(entry: ThingSpeakFeedEntry, index?: number): SoilMeasurementRecord {
  const moisture = parseFeedNumber(entry.field1);
  const temperature = parseFeedNumber(entry.field2);
  const pH = parseFeedNumber(entry.field3);
  const ec = parseFeedNumber(entry.field4);
  const nitrogen = parseFeedNumber(entry.field5);
  const phosphorus = parseFeedNumber(entry.field6);
  const potassium = parseFeedNumber(entry.field7);
  const batteryVoltage = parseFeedNumber(entry.field8);

  const batteryPercent = calculate3SBatteryPercentage(batteryVoltage);

  // Parse ISO date
  const date = new Date(entry.created_at);

  return {
    entryId: entry.entry_id,
    timestamp: entry.created_at,
    date: isNaN(date.getTime()) ? new Date() : date,
    moisture,
    temperature,
    pH,
    ec,
    nitrogen,
    phosphorus,
    potassium,
    batteryVoltage,
    batteryPercent,
    plotTag: index !== undefined ? `Spot Test #${entry.entry_id}` : undefined
  };
}

/**
 * Fetch feeds from ThingSpeak REST API
 */
export async function fetchThingSpeakFeeds(options: FetchFeedsOptions): Promise<FetchFeedsResult> {
  const { channelId, readApiKey, results = 100, startDate, endDate } = options;

  if (!channelId || channelId.trim() === '') {
    return {
      success: false,
      records: [],
      error: 'ThingSpeak Channel ID is not specified. Please configure your Channel ID in Settings or .env file.'
    };
  }

  const cleanChannelId = channelId.trim();
  const cleanApiKey = readApiKey?.trim() || '';

  // Construct URL
  const baseUrl = `https://api.thingspeak.com/channels/${cleanChannelId}/feeds.json`;
  const params = new URLSearchParams();
  
  if (cleanApiKey) {
    params.append('api_key', cleanApiKey);
  }
  
  if (results && results > 0) {
    params.append('results', Math.min(results, 8000).toString());
  }

  if (startDate) {
    params.append('start', startDate);
  }

  if (endDate) {
    params.append('end', endDate);
  }

  const requestUrl = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 429) {
      return {
        success: false,
        records: [],
        statusCode: 429,
        isRateLimited: true,
        error: 'ThingSpeak API rate limit exceeded (15-second cooldown on free tier). Retrying shortly...'
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        records: [],
        statusCode: 404,
        error: `Channel ${cleanChannelId} not found. Please verify your ThingSpeak Channel ID.`
      };
    }

    if (response.status === 400 || response.status === 401) {
      return {
        success: false,
        records: [],
        statusCode: response.status,
        error: 'Authorization failed. For private ThingSpeak channels, ensure a valid Read API Key is provided.'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        records: [],
        statusCode: response.status,
        error: `ThingSpeak API returned HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data: ThingSpeakApiResponse = await response.json();

    if (!data || !Array.isArray(data.feeds)) {
      return {
        success: false,
        records: [],
        error: 'Unexpected response structure from ThingSpeak API.'
      };
    }

    if (data.feeds.length === 0) {
      return {
        success: true,
        channelTitle: data.channel?.name || `Channel ${cleanChannelId}`,
        channelDescription: data.channel?.description,
        records: [],
        rawResponse: data,
        error: undefined
      };
    }

    // Parse feeds in chronological order (or sorted newest first as needed)
    const records = data.feeds.map((feed, idx) => transformFeedEntry(feed, idx));

    return {
      success: true,
      channelTitle: data.channel?.name || `Channel ${cleanChannelId}`,
      channelDescription: data.channel?.description,
      records,
      rawResponse: data
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error connecting to api.thingspeak.com';
    return {
      success: false,
      records: [],
      error: `Network error: ${errorMsg}. Verify your internet connection or CORS settings.`
    };
  }
}
