import { LogEntry } from "../logging-utils";
import { ILogEntryAnalyzer } from "./analyzer";
import {
  ChannelActivityAnalyzer,
  ChannelActivityRecord,
} from "./channel-activity-analyzer";
import { EventCountAnalyzer, EventCountRecord } from "./event-count-analyzer";
import {
  MessageTypeAnalyzer,
  MessageTypeCountRecord,
} from "./message-type-analyzer";
import { SpanDurationAnalyzer, Spans } from "./span-analyzer";

export interface AnalysisStateResults {
  channelActivity: ChannelActivityRecord;
  eventCounts: EventCountRecord;
  messageTypeCounts: MessageTypeCountRecord;
  spans: Spans;
}

export class UnifiedLogEntryAnalyzer {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private analyzers: ILogEntryAnalyzer<any>[];
  private logEntries: LogEntry[];

  constructor() {
    this.analyzers = [
      new ChannelActivityAnalyzer(),
      new EventCountAnalyzer(),
      new MessageTypeAnalyzer(),
      new SpanDurationAnalyzer(),
    ];
    this.logEntries = [];
  }

  updateLogEntry(entry: LogEntry): void {
    this.logEntries.push(entry);
    for (const analyzer of this.analyzers) {
      analyzer.update(entry);
    }
  }

  aggregateResults(): Partial<AnalysisStateResults> {
    // This method extracts and aggregates results from each analyzer
    return {
      channelActivity: this.analyzers[0].getResults(),
      eventCounts: this.analyzers[1].getResults(),
      messageTypeCounts: this.analyzers[2].getResults(),
      spans: this.analyzers[3].getResults(),
    };
  }

  getLogEntries(): LogEntry[] {
    return this.logEntries;
  }
}
