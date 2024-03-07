import { differenceInSeconds } from "date-fns";
import { ChannelActivityRecord } from "./analyzers/channel-activity-analyzer";
import { EventCountRecord } from "./analyzers/event-count-analyzer";
import { SEND_TO_MAIN_MSG, SEND_TO_NETWORK_MSG } from "./events";
export interface LogEntry {
  timestamp: string;
  level: string;
  target: string;
  fields: {
    message: string;
    driver: string;
    json_packet?: string;
    rssi?: number;
    "time.busy": string;
    "time.idle": string;
  };
  span?: {
    driver: string;
    name: string;
    mavlink_frame?: string;
  };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  spans: any[];
}

export interface ChartPoint {
  x: string;
  y: number;
}

export const analyzeChannelActivity = (
  logEntries: LogEntry[]
): ChannelActivityRecord => {
  const channelActivity: ChannelActivityRecord = {};
  if (logEntries.length === 0) return channelActivity;

  // Assuming logEntries are sorted by timestamp
  const startTime = new Date(logEntries[0].timestamp);
  const endTime = new Date(logEntries[logEntries.length - 1].timestamp);

  // Initialize channel activity records
  for (const entry of logEntries) {
    if (!entry.fields.driver) {
      continue;
    }
    const driver = entry.fields.driver;
    if (!channelActivity[driver]) {
      channelActivity[driver] = { sentMessages: [], receivedMessages: [] };
      for (
        let time = new Date(startTime);
        time <= endTime;
        time.setSeconds(time.getSeconds() + 1)
      ) {
        channelActivity[driver].sentMessages.push({ x: new Date(time), y: 0 });
        channelActivity[driver].receivedMessages.push({
          x: new Date(time),
          y: 0,
        });
      }
    }
  }

  // Count the sent and received messages per second for each driver
  for (const entry of logEntries) {
    const driver = entry.fields.driver;
    const timeIndex = differenceInSeconds(new Date(entry.timestamp), startTime);

    if (entry.fields.message?.includes(SEND_TO_MAIN_MSG)) {
      channelActivity[driver].sentMessages[timeIndex].y++;
    } else if (entry.fields.message?.includes(SEND_TO_NETWORK_MSG)) {
      channelActivity[driver].receivedMessages[timeIndex].y++;
    }
  }

  return channelActivity;
};

type EventCountDictionary = Record<string, number>;

export function countLogEvents(logEntries: LogEntry[]): EventCountRecord {
  const driverEventCounts: Record<string, EventCountDictionary> = {};

  for (const entry of logEntries) {
    if (!entry.fields.driver) {
      continue;
    }
    const driver = entry.fields.driver;
    const eventMessage = entry.fields.message;

    if (!driverEventCounts[driver]) {
      driverEventCounts[driver] = {};
    }

    if (!driverEventCounts[driver][eventMessage]) {
      driverEventCounts[driver][eventMessage] = 1;
    } else {
      driverEventCounts[driver][eventMessage]++;
    }
  }

  const driverChartPoints: Record<string, ChartPoint[]> = {};

  for (const driver of Object.keys(driverEventCounts)) {
    driverChartPoints[driver] = Object.keys(driverEventCounts[driver]).map(
      (eventMessage) => {
        return { x: eventMessage, y: driverEventCounts[driver][eventMessage] };
      }
    );
  }

  return driverChartPoints;
}

export type MessageTypeCountRecord = Record<string, ChartPoint[]>;

export function countMessageTypes(
  logEntries: LogEntry[],
  message_type: string
): MessageTypeCountRecord {
  const chartData: Record<string, { [msgType: string]: number }> = {};

  for (const entry of logEntries) {
    if (entry.fields.message === message_type) {
      const { driver, json_packet } = entry.fields;
      if (json_packet) {
        try {
          const packet = JSON.parse(json_packet);
          const msgType = packet.msg?.type;

          if (msgType) {
            if (!chartData[driver]) {
              chartData[driver] = {};
            }

            if (!chartData[driver][msgType]) {
              chartData[driver][msgType] = 1;
            } else {
              chartData[driver][msgType] += 1;
            }
          }
        } catch (error) {
          console.error("Error parsing JSON packet:", error);
        }
      }
    }
  }

  // Convert the intermediate object into an array of ChartPoints
  const chartPoints: Record<string, ChartPoint[]> = {};
  for (const [driver, counts] of Object.entries(chartData)) {
    chartPoints[driver] = Object.entries(counts).map(([msgType, count]) => ({
      x: msgType,
      y: count,
    }));
  }

  return chartPoints;
}
