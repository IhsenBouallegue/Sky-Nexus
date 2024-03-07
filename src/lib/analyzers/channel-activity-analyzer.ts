import { produce } from "immer";
import { SEND_TO_MAIN_MSG, SEND_TO_NETWORK_MSG } from "../events";
import { LogEntry } from "../logging-utils";
import { ILogEntryAnalyzer } from "./analyzer";

export interface TimeSeriesPoint {
  x: Date;
  y: number;
}

type ChannelActivity = {
  sentMessages: TimeSeriesPoint[];
  receivedMessages: TimeSeriesPoint[];
};

export type ChannelActivityRecord = Record<string, ChannelActivity>;

export class ChannelActivityAnalyzer
  implements ILogEntryAnalyzer<ChannelActivityRecord>
{
  private channelActivity: ChannelActivityRecord = {};

  update(entry: LogEntry): void {
    this.channelActivity = produce(this.channelActivity, (draft) => {
      const driver = entry.fields.driver;
      if (!driver) {
        return; // Skip entries without a driver
      }

      // Lazy initialization of channel activity data for the driver
      draft[driver] = draft[driver] || {
        sentMessages: [],
        receivedMessages: [],
      };

      const timestamp = new Date(entry.timestamp);
      // Assuming the granularity is per second, we round down to the nearest second
      const roundedTimestamp = new Date(timestamp.setMilliseconds(0));

      // Update sent or received messages based on the log entry message content
      if (entry.fields.message?.includes(SEND_TO_MAIN_MSG)) {
        this.incrementMessageCount(
          draft[driver].sentMessages,
          roundedTimestamp
        );
      } else if (entry.fields.message?.includes(SEND_TO_NETWORK_MSG)) {
        this.incrementMessageCount(
          draft[driver].receivedMessages,
          roundedTimestamp
        );
      }
    });
  }

  getResults(): ChannelActivityRecord {
    return this.channelActivity;
  }

  private incrementMessageCount(
    timeSeries: TimeSeriesPoint[],
    timestamp: Date
  ): void {
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
