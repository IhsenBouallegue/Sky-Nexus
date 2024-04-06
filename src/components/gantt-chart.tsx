import { SpanDuration, Spans } from "@/lib/analyzers/span-analyzer";
import { parseDuration } from "@/lib/logging-event-utils";
import { LogEntry } from "@/lib/logging-utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

type SpanColorLookup = Record<string, string>;

const spanColors: SpanColorLookup = {
  Transmitting: "bg-yellow-500",
  Receiving: "bg-purple-500",
  "Prepare For TX": "bg-orange-500",
};

export function extractSpans(logEntries: LogEntry[]): Spans {
  const spans: Spans = {};

  for (const entry of logEntries) {
    // Skip entries that are not spans
    if (!entry.span || !entry.fields["time.busy"]) {
      continue;
    }
    const { name } = entry.span;
    const busyDuration = parseDuration(entry.fields["time.busy"]);
    const timestamp = new Date(entry.timestamp).getTime();
    const end = timestamp; // Assuming the timestamp is the end of the event
    const start = end - busyDuration;

    if (!spans[name]) {
      spans[name] = [];
    }

    spans[name].push({ start, end });
  }

  return spans;
}

export default function GanttChart({ spans }: { spans: Spans }) {
  // Calculate the earliest start time and the latest end time for all spans
  // console.log(spans);
  const allSpans = Object.values(spans).flat();

  const earliestStart = Math.min(...allSpans.map((span) => span.start));
  const latestEnd = Math.max(...allSpans.map((span) => span.end));
  const totalTimeSpan = latestEnd - earliestStart;
  const [pxPerMs, setPxPerMs] = React.useState(0.1); // Adjust this scale factor to suit your needs
  const chartWidth = totalTimeSpan * pxPerMs;

  return (
    <div>
      <div className="flex gap-2 w-full mb-4">
        <Button className="ml-auto" onClick={() => setPxPerMs((prev) => prev * 2)}>
          +
        </Button>
        <Button className="mr-8" onClick={() => setPxPerMs((prev) => prev / 2)}>
          -
        </Button>
      </div>
      {allSpans.length === 0 ? (
        <div>No spans to display</div>
      ) : (
        <div className="overflow-auto">
          <div
            className="flex"
            style={{
              width: `${chartWidth}px`,
            }}
          >
            <div className="flex flex-col">
              {Object.entries(spans).map(([name]) => (
                <div key={name} className="text-md font-semibold w-36 h-12 mb-6">
                  {name}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {Object.entries(spans).map(([name, spans]) => (
                <SpanTrack key={name} name={name} spans={spans} earliestStart={earliestStart} pxPerMs={pxPerMs} />
              ))}
              <Timeline earliestStart={earliestStart} latestEnd={latestEnd} chartWidth={chartWidth} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpanTrack({
  name,
  spans,
  earliestStart,
  pxPerMs,
}: {
  name: string;
  spans: SpanDuration[];
  earliestStart: number;
  pxPerMs: number;
}) {
  return (
    <div key={name} className="relative h-12 mb-6">
      {spans.map((span) => (
        <SpanBox
          key={`${name}-${span.start}}`}
          color={spanColors[name] ?? "bg-gray-500"}
          span={span}
          earliestStart={earliestStart}
          pxPerMs={pxPerMs}
        />
      ))}
    </div>
  );
}

function SpanBox({
  span,
  color,
  earliestStart,
  pxPerMs,
}: {
  span: SpanDuration;
  color: string;
  earliestStart: number;
  pxPerMs: number;
}) {
  const offset = (span.start - earliestStart) * pxPerMs;
  const width = (span.end - span.start) * pxPerMs;
  return (
    <HoverCard openDelay={10} closeDelay={10}>
      <HoverCardContent
        style={{
          position: "absolute",
          left: `${offset + 10}px`,
        }}
      >
        <div>Start: {format(new Date(span.start), "HH:mm:ss:SSSS")}</div>
        <div>End: {format(new Date(span.end), "HH:mm:ss:SSSS")}</div>
      </HoverCardContent>
      <HoverCardTrigger>
        <div
          className={cn(`h-full ${color} rounded`)}
          style={{
            position: "absolute",
            left: `${offset}px`,
            width: `${width}px`,
          }}
        />
      </HoverCardTrigger>
    </HoverCard>
  );
}

function Timeline({
  earliestStart,
  latestEnd,
  chartWidth,
}: {
  earliestStart: number;
  latestEnd: number;
  chartWidth: number;
}) {
  const totalDuration = latestEnd - earliestStart;
  const tickFrequency = 1000 * 10; // 1 second (in ms) * numberOfSeconds untill next tick
  const numOfIntervals = totalDuration / tickFrequency;
  const intervalWidth = chartWidth / numOfIntervals;
  return (
    <div className="flex h-6" style={{ width: `${chartWidth}px` }}>
      {[...Array(Math.ceil(numOfIntervals) + 1)].map((_, index) => (
        <div
          key={earliestStart + index * tickFrequency}
          className="border-r-2 border-white text-xs pl-2"
          style={{
            width: `${intervalWidth}px`,
          }}
        >
          {format(new Date(earliestStart + index * tickFrequency), "HH:mm:ss")}
        </div>
      ))}
    </div>
  );
}
