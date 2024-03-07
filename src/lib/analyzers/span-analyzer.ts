import { produce } from "immer";
import { parseDuration } from "../logging-event-utils";
import { LogEntry } from "../logging-utils";
import { ILogEntryAnalyzer } from "./analyzer";

export type SpanDuration = {
  start: number;
  end: number;
};
export type Spans = Record<string, SpanDuration[]>;

export class SpanDurationAnalyzer implements ILogEntryAnalyzer<Spans> {
  private spans: Spans = {};

  update(entry: LogEntry): void {
    // Assuming entry.span.name is the string key to group span durations
    if (!entry.span || !entry.fields["time.busy"]) {
      return;
    }
    const name = entry.span.name;
    const busyDuration = parseDuration(entry.fields["time.busy"]); // Implement parseDuration accordingly
    const timestamp = new Date(entry.timestamp).getTime();
    const end = timestamp;
    const start = end - busyDuration;

    this.spans = produce(this.spans, (draft) => {
      if (!draft[name]) {
        draft[name] = [];
      }
      draft[name].push({ start, end });
    });
  }

  getResults(): Spans {
    return this.spans;
  }
}
