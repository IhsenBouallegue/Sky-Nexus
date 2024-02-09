import { NetworkEvents, normalizeEventTimes } from "@/lib/logging-event-utils";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

interface ChartPoint {
  start: number;
  end: number;
}

export default function NetworkTimeline({
  globalStart,
  globalEnd,
  rawNetworkEvents,
}: {
  rawNetworkEvents: NetworkEvents;
  globalStart: number;
  globalEnd: number;
}) {
  const networkEvents = useMemo(
    () => normalizeEventTimes(rawNetworkEvents, globalStart, globalEnd),
    [rawNetworkEvents, globalStart, globalEnd]
  );

  const renderEventBar = (event: ChartPoint, color: string, index: number) => {
    // Using the normalized start and end times to calculate offset and width
    const offset = event.start; // already a percentage
    const width = event.end - event.start; // already a percentage

    return (
      <div
        key={index}
        className={cn(`h-full ${color} rounded`)}
        style={{
          left: `${offset}%`,
          width: `${width}%`,
          minWidth: "1px",
          position: "absolute",
        }}
      />
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {Object.keys(networkEvents).map((driver) => (
          <div key={driver} className="mb-8">
            <div className="font-bold mb-2">
              {driver.toUpperCase().replace("_", " ")}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex">
                <div className="text-sm font-semibold text-slate-500 w-28">
                  Transmitting
                </div>
                <div className="relative h-12 w-full">
                  {networkEvents[driver].transmitting.map((event, index) =>
                    renderEventBar(event, "bg-yellow-500", index)
                  )}
                </div>
              </div>
              <div className="flex">
                <div className="text-sm font-semibold text-slate-500 w-28">
                  Receiving
                </div>
                <div className="relative h-12 w-full">
                  {networkEvents[driver].receiving.map((event, index) =>
                    renderEventBar(event, "bg-purple-500", index)
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
