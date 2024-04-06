import { LogEntry } from "@/lib/logging-utils";
import { ILogEntryAnalyzer } from "./analyzer";
import { ChannelActivityAnalyzer, ChannelActivityResults } from "./channel-activity-analyzer";
import { EventCountAnalyzer, EventCountResults } from "./event-count-analyzer";
import { MessageTypeAnalyzer, MessageTypeCountResults } from "./message-type-analyzer";
import { NodeRssiAnalyzer, NodeRssiResults } from "./node-rssi-analyzer";
import { PDRResults, PacketDeliveryRatioAnalyzer } from "./packet-delivery-ratio-analyzer";
import { SpanDurationAnalyzer, SpansResults } from "./span-analyzer";

export enum AnalyzerKeys {
  PacketDeliveryRatio = "packetDeliveryRatio",
  NodeRssi = "nodeRssi",
  ChannelActivity = "channelActivity",
  Span = "span",
  EventCount = "eventCount",
  MessageType = "messageType",
  // Add more keys as necessary
}

type AnalysisResults = {
  [AnalyzerKeys.PacketDeliveryRatio]?: PDRResults;
  [AnalyzerKeys.NodeRssi]?: NodeRssiResults;
  [AnalyzerKeys.ChannelActivity]?: ChannelActivityResults;
  [AnalyzerKeys.Span]?: SpansResults;
  [AnalyzerKeys.EventCount]?: EventCountResults;
  [AnalyzerKeys.MessageType]?: MessageTypeCountResults;
  // Define additional analysis result types as necessary.
};

export class UnifiedAnalyzer {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private analyzers: Record<string, ILogEntryAnalyzer<any>> = {};

  constructor() {
    this.registerAnalyzer(AnalyzerKeys.PacketDeliveryRatio, new PacketDeliveryRatioAnalyzer());
    this.registerAnalyzer(AnalyzerKeys.NodeRssi, new NodeRssiAnalyzer());
    this.registerAnalyzer(AnalyzerKeys.ChannelActivity, new ChannelActivityAnalyzer());
    this.registerAnalyzer(AnalyzerKeys.Span, new SpanDurationAnalyzer());
    this.registerAnalyzer(AnalyzerKeys.EventCount, new EventCountAnalyzer());
    this.registerAnalyzer(AnalyzerKeys.MessageType, new MessageTypeAnalyzer());
  }

  registerAnalyzer<T>(key: AnalyzerKeys, analyzer: ILogEntryAnalyzer<T>): void {
    this.analyzers[key] = analyzer;
  }

  // Update all analyzers with a log entry.
  update(nodeId: string, entry: LogEntry): void {
    for (const analyzer of Object.values(this.analyzers)) {
      analyzer.update(nodeId, entry);
    }
  }

  // Aggregate results from all analyzers.
  aggregateResults(): AnalysisResults {
    const results: Partial<AnalysisResults> = {};
    for (const key in this.analyzers) {
      results[key as keyof AnalysisResults] = this.analyzers[key].getResults();
    }
    return results as AnalysisResults;
  }

  getAnalyzerResult<K extends AnalyzerKeys>(key: K): AnalysisResults[K] {
    const analyzer = this.analyzers[key];
    if (!analyzer) {
      throw new Error(`Analyzer with key '${key}' not registered.`);
    }
    return analyzer.getResults();
  }
}
