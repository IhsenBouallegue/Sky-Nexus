import { produce } from "immer";
import { ChartPoint, LogEntry } from "../logging-utils";
import { Driver, ILogEntryAnalyzer } from "./analyzer";

export type EventCountRecord = Record<Driver, ChartPoint[]>;

export class EventCountAnalyzer implements ILogEntryAnalyzer<EventCountRecord> {
  private eventCounts: EventCountRecord = {};

  update(entry: LogEntry) {
    // Wrap the update logic with produce for an immutable update
    this.eventCounts = produce(this.eventCounts, (draft) => {
      const driver = entry.fields.driver;
      const eventMessage = entry.fields.message;

      if (!driver || !eventMessage) {
        return;
      }

      // Ensure the array for this driver exists
      draft[driver] = draft[driver] || [];

      // Attempt to find an existing chart point for this message
      const chartPoint = draft[driver].find(
        (point) => point.x === eventMessage
      );

      if (chartPoint) {
        // Increment count if the chart point exists
        chartPoint.y += 1;
      } else {
        // Create a new chart point if it doesn't exist
        draft[driver].push({ x: eventMessage, y: 1 });
      }
    });
  }

  getResults(): EventCountRecord {
    return this.eventCounts;
  }
}
