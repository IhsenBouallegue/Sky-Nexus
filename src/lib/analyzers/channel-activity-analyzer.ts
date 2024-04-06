import { SEND_TO_MAIN_MSG, SEND_TO_NETWORK_MSG } from "@/lib/events";
import { LogEntry } from "@/lib/logging-utils";
import { NodeId } from "@/lib/store";
import { produce } from "immer";
import { Driver, ILogEntryAnalyzer } from "./analyzer";

export interface TimeSeriesPoint {
  x: Date;
  y: number;
}

type ChannelActivity = {
  sentMessages: TimeSeriesPoint[];
  receivedMessages: TimeSeriesPoint[];
};

export type ChannelActivityResults = Record<NodeId, Record<Driver, ChannelActivity>>;

export class ChannelActivityAnalyzer implements ILogEntryAnalyzer<ChannelActivityResults> {
  private channelActivity: ChannelActivityResults = {};

  update(nodeId: string, entry: LogEntry): void {
    if (!this.channelActivity[nodeId]) {
      this.channelActivity[nodeId] = {};
    }

    this.channelActivity[nodeId] = produce(this.channelActivity[nodeId] || {}, (draft) => {
      const driver = entry.fields.driver;
      if (!driver) {
        return; // Skip entries without a driver
      }

      // Initialize channel activity data for this node and driver if not already present
      draft[driver] = draft[driver] || {
        sentMessages: [],
        receivedMessages: [],
      };

      const timestamp = new Date(entry.timestamp);
      // Assuming the granularity is per second, we round down to the nearest second
      const roundedTimestamp = new Date(timestamp.setMilliseconds(0));

      // Update sent or received messages based on the log entry message content
      if (entry.fields.message?.includes(SEND_TO_MAIN_MSG)) {
        this.incrementMessageCount(draft[driver].sentMessages, roundedTimestamp);
      } else if (entry.fields.message?.includes(SEND_TO_NETWORK_MSG)) {
        this.incrementMessageCount(draft[driver].receivedMessages, roundedTimestamp);
      }
    });

    // Ensure the outer structure is updated to reflect changes
    this.channelActivity = { ...this.channelActivity, [nodeId]: this.channelActivity[nodeId] };
  }

  getResults(): ChannelActivityResults {
    return this.channelActivity;
  }

  private incrementMessageCount(timeSeries: TimeSeriesPoint[], timestamp: Date): void {
    const lastPoint = timeSeries[timeSeries.length - 1];
    if (lastPoint && +lastPoint.x === +timestamp) {
      // Increment count if the last point matches the current timestamp
      lastPoint.y++;
    } else {
      // Add a new point for the new timestamp
      timeSeries.push({ x: timestamp, y: 1 });
    }
  }
}
