import { Driver, Event, ILogEntryAnalyzer } from "@/lib/analyzers/analyzer";
import { LogEntry } from "@/lib/logging-utils";
import { NodeId } from "@/lib/store";
import { produce } from "immer";

type MessageTypeCount = {
  [msgType: string]: number;
};
type EventMessageCount = Record<Event, MessageTypeCount>;

export type MessageTypeCountResults = Record<NodeId, Record<Driver, EventMessageCount>>;

export class MessageTypeAnalyzer implements ILogEntryAnalyzer<MessageTypeCountResults> {
  private messageTypeCounts: MessageTypeCountResults = {};

  update(nodeId: string, entry: LogEntry): void {
    if (!this.messageTypeCounts[nodeId]) {
      this.messageTypeCounts[nodeId] = {};
    }
    // Using Immer's produce to handle the immutable update
    this.messageTypeCounts[nodeId] = produce(this.messageTypeCounts[nodeId] || {}, (draft) => {
      const { driver, message, json_packet } = entry.fields;

      if (driver && message && json_packet) {
        try {
          const packet = JSON.parse(json_packet);
          const msgType = packet.msg?.type;

          if (msgType) {
            draft[driver] = draft[driver] || {}; // Ensure driver object exists
            draft[driver][message] = draft[driver][message] || {}; // Ensure message object exists

            // Increment message type count or initialize it to 1
            draft[driver][message][msgType] = (draft[driver][message][msgType] || 0) + 1;
          }
        } catch (error) {
          console.error("Error parsing JSON packet:", error);
        }
      }
    });
    this.messageTypeCounts = { ...this.messageTypeCounts, [nodeId]: this.messageTypeCounts[nodeId] };
  }

  getResults(): MessageTypeCountResults {
    return this.messageTypeCounts;
  }
}
