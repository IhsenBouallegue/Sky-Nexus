import { ILogEntryAnalyzer } from "@/lib/analyzers/analyzer";
import { LogEntry, TimeSeriesPoint } from "@/lib/logging-utils";
import { NodeId } from "@/lib/store";

interface SnrResults {
  snrTimeSeries: TimeSeriesPoint[];
  averageSnr: number | null;
}

export type NodeSnrResults = Record<NodeId, SnrResults>;

export class NodeSnrAnalyzer implements ILogEntryAnalyzer<NodeSnrResults> {
  private nodeSnrResults: NodeSnrResults = {};

  update(nodeId: string, entry: LogEntry): void {
    // Initialize the data structure for a new node
    if (!this.nodeSnrResults[nodeId]) {
      this.nodeSnrResults[nodeId] = { snrTimeSeries: [], averageSnr: null };
    }

    // Ensure the entry has an SNR value before proceeding
    if (typeof entry.fields.snr === "number") {
      const timestamp = new Date(entry.timestamp);
      const snrValue = entry.fields.snr;

      // Add the new SNR value to the time series for the node
      this.nodeSnrResults[nodeId].snrTimeSeries.push({ x: timestamp, y: snrValue });

      // Recalculate the average SNR for the node
      const totalSnr = this.nodeSnrResults[nodeId].snrTimeSeries.reduce((sum, point) => sum + point.y, 0);
      const numEntries = this.nodeSnrResults[nodeId].snrTimeSeries.length;
      this.nodeSnrResults[nodeId].averageSnr = totalSnr / numEntries;
    }
  }

  getResults(): NodeSnrResults {
    return this.nodeSnrResults;
  }
}
