import { differenceInSeconds } from "date-fns";
import { TRANSMIT_INITIATED_MSG } from "./events";
import { LogEntry, TimeSeriesPoint } from "./logging-utils";

type TransmissionRecord = Record<string, TimeSeriesPoint[]>;

export const countTransmissionsPerSecond = (
  logEntries: LogEntry[]
): TransmissionRecord => {
  const transmissionCounts: TransmissionRecord = {};
  if (logEntries.length === 0) return transmissionCounts;
  // Assuming logEntries are sorted by timestamp
  const startTime = new Date(logEntries[0].timestamp);
  const endTime = new Date(logEntries[logEntries.length - 1].timestamp);

  // Initialize transmission counts
  for (const entry of logEntries) {
    const driver = entry.fields.driver;
    if (!transmissionCounts[driver]) {
      transmissionCounts[driver] = [];
      for (
        let time = new Date(startTime);
        time <= endTime;
        time.setSeconds(time.getSeconds() + 1)
      ) {
        transmissionCounts[driver].push({ x: new Date(time), y: 0 });
      }
    }
  }

  // Count the transmissions per second for each driver
  for (const entry of logEntries) {
    if (entry.fields.message === TRANSMIT_INITIATED_MSG) {
      const driver = entry.fields.driver;
      const timeIndex = differenceInSeconds(
        new Date(entry.timestamp),
        startTime
      );

      transmissionCounts[driver][timeIndex].y++;
    }
  }

  return transmissionCounts;
};
