import { parseISO, format } from "date-fns";

export interface DataPoint {
  x: Date; // Date object for time
  y: number; // Corresponding value
}

export interface LogEntry {
  timestamp: string;
  fields: {
    message: string;
    driver: string; // Assuming this indicates the type of event
  };
}

export const processData = (
  logData: LogEntry[],
  driverName: string
): {
  sentData: DataPoint[];
  receivedData: DataPoint[];
} => {
  const sentCounts: { [key: string]: number } = {};
  const receivedCounts: { [key: string]: number } = {};

  logData.forEach((entry) => {
    if (entry.fields.driver === driverName) {
      // Format timestamp to second-precision string
      const formattedDate = format(
        parseISO(entry.timestamp),
        "yyyy-MM-dd HH:mm:ss"
      );

      if (entry.fields.message.includes("Sending")) {
        sentCounts[formattedDate] = (sentCounts[formattedDate] || 0) + 1;
      } else if (entry.fields.message.includes("Received")) {
        receivedCounts[formattedDate] =
          (receivedCounts[formattedDate] || 0) + 1;
      }
    }
  });

  const sentData = Object.keys(sentCounts).map((key) => ({
    x: new Date(key),
    y: sentCounts[key],
  }));
  const receivedData = Object.keys(receivedCounts).map((key) => ({
    x: new Date(key),
    y: receivedCounts[key],
  }));

  return { sentData, receivedData };
};
