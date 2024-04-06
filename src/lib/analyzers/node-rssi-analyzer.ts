import { ILogEntryAnalyzer } from "@/lib/analyzers/analyzer";
import { LogEntry } from "@/lib/logging-utils";
import { NodeId } from "@/lib/store";

interface TimeSeriesPoint {
  x: Date;
  y: number;
}

interface RssiResults {
  rssiTimeSeries: TimeSeriesPoint[];
  averageRssi: number | null; // Add this to store the average RSSI
}

export type NodeRssiResults = Record<NodeId, RssiResults>;

export class NodeRssiAnalyzer implements ILogEntryAnalyzer<NodeRssiResults> {
  private nodeRssiResults: NodeRssiResults = {};

  update(nodeId: string, entry: LogEntry): void {
    // Initialize the data structure for a new node
    if (!this.nodeRssiResults[nodeId]) {
      this.nodeRssiResults[nodeId] = { rssiTimeSeries: [], averageRssi: null };
    }

    // Process the log entry for the given node
    this.updateRssiForNode(nodeId, entry);
  }

  getResults(): NodeRssiResults {
    return this.nodeRssiResults;
  }

  private updateRssiForNode(nodeId: string, entry: LogEntry): void {
    // Ensure the entry has an RSSI value before proceeding
    if (typeof entry.fields.rssi === "number") {
      const timestamp = new Date(entry.timestamp);
      const rssiValue = entry.fields.rssi;

      // Add the new RSSI value to the time series for the node
      this.nodeRssiResults[nodeId].rssiTimeSeries.push({ x: timestamp, y: rssiValue });

      // Recalculate the average RSSI for the node
      const totalRssi = this.nodeRssiResults[nodeId].rssiTimeSeries.reduce((sum, point) => sum + point.y, 0);
      const numEntries = this.nodeRssiResults[nodeId].rssiTimeSeries.length;
      this.nodeRssiResults[nodeId].averageRssi = totalRssi / numEntries;
    }
  }
}
