import { Driver, ILogEntryAnalyzer } from "@/lib/analyzers/analyzer";
import { ChartPoint, LogEntry } from "@/lib/logging-utils";
import { NodeId } from "@/lib/store";
import { produce } from "immer";

export type EventCountResults = Record<NodeId, Record<Driver, ChartPoint[]>>;

export class EventCountAnalyzer implements ILogEntryAnalyzer<EventCountResults> {
  private eventCounts: EventCountResults = {};

  update(nodeId: string, entry: LogEntry): void {
    if (!this.eventCounts[nodeId]) {
      this.eventCounts[nodeId] = {};
    }

    this.eventCounts[nodeId] = produce(this.eventCounts[nodeId], (draft) => {
      const driver = entry.fields.driver;
      const eventMessage = entry.fields.message;

      if (!driver || !eventMessage) {
        return;
      }

      // Ensure the array for this driver exists
      if (!draft[driver]) draft[driver] = [];

      // Attempt to find an existing chart point for this message
      const chartPoint = draft[driver].find((point) => point.x === eventMessage);

      if (chartPoint) {
        // Increment count if the chart point exists
        chartPoint.y += 1;
      } else {
        // Create a new chart point if it doesn't exist
        draft[driver].push({ x: eventMessage, y: 1 });
      }
    });

    this.eventCounts = { ...this.eventCounts, [nodeId]: this.eventCounts[nodeId] };
  }

  getResults(): EventCountResults {
    return this.eventCounts;
  }
}
