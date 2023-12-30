import { format, parseISO } from "date-fns";
export interface LogEntry {
  timestamp: string;
  level: string;
  target: string;
  fields: {
    message: string;
    driver: string;
    json_packet?: string;
  };
}

export interface DataPoint {
  x: Date;
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
      if (entry.fields.message?.includes("Sending")) {
        sentCounts[formattedTime]++;
      } else if (entry.fields.message?.includes("Received")) {
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

export interface TransmissionChartPoint {
  date: string;
  count: number;
}

export const processDataForBarChart = (
  logData: LogEntry[],
  driverName: string
): TransmissionChartPoint[] => {
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
    date: format(parseISO(key), "HH:mm:ss"),
    count: value,
  }));
};
