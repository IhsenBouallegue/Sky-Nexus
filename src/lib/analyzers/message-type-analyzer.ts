import { produce } from "immer";
import { LogEntry } from "../logging-utils";
import { Driver, Event, ILogEntryAnalyzer } from "./analyzer";

export type MessageTypeCountRecord = Record<
  Driver,
  Record<Event, { [msgType: string]: number }>
>;

export class MessageTypeAnalyzer
  implements ILogEntryAnalyzer<MessageTypeCountRecord>
{
  private messageTypeCounts: MessageTypeCountRecord = {};

  update(entry: LogEntry): void {
    // Using Immer's produce to handle the immutable update
    this.messageTypeCounts = produce(this.messageTypeCounts, (draft) => {
      const { driver, message, json_packet } = entry.fields;

      if (driver && message && json_packet) {
        try {
          const packet = JSON.parse(json_packet);
          const msgType = packet.msg?.type;

          if (msgType) {
            draft[driver] = draft[driver] || {}; // Ensure driver object exists
            draft[driver][message] = draft[driver][message] || {}; // Ensure message object exists

            // Increment message type count or initialize it to 1
            draft[driver][message][msgType] =
              (draft[driver][message][msgType] || 0) + 1;
          }
        } catch (error) {
          console.error("Error parsing JSON packet:", error);
        }
      }
    });
  }

  getResults(): MessageTypeCountRecord {
    return this.messageTypeCounts;
  }
}
