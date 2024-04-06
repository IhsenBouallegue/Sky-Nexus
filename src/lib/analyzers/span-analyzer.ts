import { ILogEntryAnalyzer } from "@/lib/analyzers/analyzer";
import { parseDuration } from "@/lib/logging-event-utils";
import { LogEntry } from "@/lib/logging-utils";
import { NodeId } from "@/lib/store";
import { produce } from "immer";

export type SpanDuration = {
  start: number;
  end: number;
};
export type Spans = Record<string, SpanDuration[]>;
export type SpansResults = Record<NodeId, Record<string, SpanDuration[]>>;

export class SpanDurationAnalyzer implements ILogEntryAnalyzer<SpansResults> {
  private spans: SpansResults = {};

  update(nodeId: string, entry: LogEntry): void {
    if (!this.spans[nodeId]) {
      this.spans[nodeId] = {};
    }
    // Assuming entry.span.name is the string key to group span durations
    if (!entry.span || !entry.fields["time.busy"]) {
      return;
    }

    const name = entry.span.name;
    this.spans[nodeId] = produce(this.spans[nodeId] || {}, (draft) => {
      const busyDuration = parseDuration(entry.fields["time.busy"]);
      const timestamp = new Date(entry.timestamp).getTime();
      const end = timestamp;
      const start = end - busyDuration;

      if (!draft[name]) {
        draft[name] = [];
      }
      draft[name].push({ start, end });
    });

    this.spans = { ...this.spans, [nodeId]: this.spans[nodeId] };
  }

  getResults(): SpansResults {
    return this.spans;
  }
}
