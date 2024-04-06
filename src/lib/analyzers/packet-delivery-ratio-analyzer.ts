import { ILogEntryAnalyzer } from "@/lib/analyzers/analyzer";
import { LogEntry } from "@/lib/logging-utils";

export interface PDRResults {
  sentPackets: number;
  receivedPackets: number;
  ratio: number;
}

export class PacketDeliveryRatioAnalyzer implements ILogEntryAnalyzer<PDRResults> {
  private packetTransmissions: Record<string, { sent: boolean; received: boolean }> = {};

  update(_nodeId: string, entry: LogEntry) {
    const packetId = this.extractPacketIdFromJson(entry); // Use the JSON-based extraction method
    if (!packetId) return; // Skip processing if no packet ID is found

    // Determine if the log entry represents a sent or received message
    const isSentMessage = entry.fields.message.includes("Sending packet");
    const isReceivedMessage = entry.fields.message.includes("Received packet");

    // Initialize the packet transmission record if not already present
    if (!this.packetTransmissions[packetId]) {
      this.packetTransmissions[packetId] = { sent: false, received: false };
    }

    // Update the transmission record based on whether the packet was sent or received
    if (isSentMessage) {
      this.packetTransmissions[packetId].sent = true;
    } else if (isReceivedMessage) {
      this.packetTransmissions[packetId].received = true;
    }
  }

  getResults(): PDRResults {
    const sentPackets = Object.values(this.packetTransmissions).filter((pt) => pt.sent).length;
    const receivedPackets = Object.values(this.packetTransmissions).filter((pt) => pt.received).length;
    const ratio = sentPackets > 0 ? receivedPackets / sentPackets : 0; // Avoid division by zero
    return { sentPackets, receivedPackets, ratio };
  }

  private extractPacketIdFromJson(entry: LogEntry): string | null {
    try {
      // Assuming json_packet is a JSON string that includes identifiable and unique info
      const packetData = JSON.parse(entry.fields.json_packet || "{}");
      // Construct a unique ID using relevant fields, e.g., component_id and sequence
      if (
        packetData.header?.system_id &&
        packetData.header?.component_id &&
        packetData.header?.sequence !== undefined
      ) {
        return `${packetData.header.system_id}-${packetData.header.component_id}-${packetData.header.sequence}`;
      }
    } catch (error) {
      console.error("Error parsing json_packet:", error);
    }
    return null;
  }
}
