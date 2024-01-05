import { format, parseISO } from "date-fns";
import { SEND_TO_MAIN_MSG, TRANSMIT_INITIATED_MSG } from "./events";
export interface LogEntry {
  timestamp: string;
  level: string;
  target: string;
  fields: {
    message: string;
    driver: string;
    json_packet?: string;
    rssi?: number;
  };
}

export interface DataPoint {
  x: Date;
  y: number;
}

export interface ChartPoint {
  x: string;
  y: number;
}

export const processData = (
  logData: LogEntry[],
  driverName: string
): { sentData: DataPoint[]; receivedData: DataPoint[] } => {
  const sentCounts: { [key: string]: number } = {};
  const receivedCounts: { [key: string]: number } = {};

  // Find the start and end time of the logs
  const times = logData.map((entry) => entry.timestamp);
  const startTime = new Date(times[0]);
  const endTime = new Date(times[times.length - 1]);

  // Initialize every second between start and end time to 0
  for (
    let time = new Date(startTime);
    time <= endTime;
    time.setSeconds(time.getSeconds() + 1)
  ) {
    const formattedTime = format(time, "yyyy-MM-dd HH:mm:ss");
    sentCounts[formattedTime] = 0;
    receivedCounts[formattedTime] = 0;
  }

  // Count the sent and received messages per second
  // biome-ignore lint/complexity/noForEach: <explanation>
  logData.forEach((entry) => {
    if (entry.fields.driver === driverName) {
      const formattedTime = format(entry.timestamp, "yyyy-MM-dd HH:mm:ss");
      if (entry.fields.message?.includes(SEND_TO_MAIN_MSG)) {
        sentCounts[formattedTime]++;
      } else if (entry.fields.message?.includes(TRANSMIT_INITIATED_MSG)) {
        receivedCounts[formattedTime]++;
      }
    }
  });

  // Transform the counts into DataPoint arrays
  const sentData: DataPoint[] = Object.keys(sentCounts).map((time) => ({
    x: parseISO(time),
    y: sentCounts[time],
  }));
  const receivedData: DataPoint[] = Object.keys(receivedCounts).map((time) => ({
    x: parseISO(time),
    y: receivedCounts[time],
  }));

  return { sentData, receivedData };
};

export const processDataForBarChart = (
  logData: LogEntry[],
  driverName: string
): ChartPoint[] => {
  let cumulativeCount = 0;
  const dataBySecond: { [key: string]: number } = {};

  // biome-ignore lint/complexity/noForEach: <explanation>
  logData.forEach((entry) => {
    if (entry.fields.driver === driverName) {
      const secondKey = format(
        parseISO(entry.timestamp),
        "yyyy-MM-dd HH:mm:ss"
      );

      if (entry.fields.message.includes("Transmit")) {
        cumulativeCount = 0;
      } else if (entry.fields.message.includes("Received")) {
        cumulativeCount++;
      }

      dataBySecond[secondKey] = cumulativeCount;
    }
  });

  return Object.entries(dataBySecond).map(([key, value]) => ({
    x: format(parseISO(key), "HH:mm:ss"),
    y: value,
  }));
};

type EventCountDictionary = Record<string, number>;

export function countLogEvents(
  logEntries: LogEntry[]
): Record<string, ChartPoint[]> {
  const driverEventCounts: Record<string, EventCountDictionary> =
    logEntries.reduce(
      (acc, entry) => {
        const driver = entry.fields.driver || "global";
        const eventMessage = entry.fields.message;

        if (!acc[driver]) {
          acc[driver] = {};
        }

        acc[driver][eventMessage] = (acc[driver][eventMessage] || 0) + 1;

        return acc;
      },
      {} as Record<string, EventCountDictionary>
    );

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
