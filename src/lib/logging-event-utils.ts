import { LogEntry } from "./logging-utils";

interface EventDuration {
  start: number;
  end: number;
}

interface DriverEvents {
  transmitting: EventDuration[];
  receiving: EventDuration[];
}

type NetworkEvents = Record<string, DriverEvents>;

export function extractNetworkEventDurations(
  logEntries: LogEntry[]
): NetworkEvents {
  const events: NetworkEvents = {};

  for (const entry of logEntries) {
    if (!entry.span || !entry.fields["time.busy"]) continue; // Skip entries that don't have a busy time (e.g., "Transmitting"
    const { driver, name } = entry.span;
    const busyDuration = parseDuration(entry.fields["time.busy"]);
    const timestamp = new Date(entry.timestamp).getTime();
    const end = timestamp; // Assuming the timestamp is the end of the event
    const start = end - busyDuration; // Calculate start by subtracting busy duration from the end

    if (!events[driver]) {
      events[driver] = { transmitting: [], receiving: [] };
    }

    if (name === "Transmitting" || name === "Receiving") {
      const eventType = name.toLowerCase() as "transmitting" | "receiving";
      events[driver][eventType].push({ start, end });
    }
  }

  return events;
}
// Helper function to parse duration strings (e.g., "56.1µs", "44.1ms") into milliseconds
function parseDuration(durationStr: string): number {
  const units = {
    ns: 1e-6, // nanoseconds to milliseconds
    µs: 1e-3, // microseconds to milliseconds
    ms: 1, // milliseconds to milliseconds
    s: 1e3, // seconds to milliseconds
  };
  const match = durationStr.match(/(\d+(\.\d+)?)(ns|µs|ms|s)/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[3] as keyof typeof units;
    return value * units[unit];
  }
  return 0;
}

export function normalizeEventTimes(
  networkEvents: NetworkEvents,
  globalStart: number,
  globalEnd: number
): NetworkEvents {
  const range = globalEnd - globalStart;

  // Function to normalize individual event times
  const normalizeTime = (time: number) => ((time - globalStart) / range) * 100;

  // Create a new NetworkEvents object to store normalized times
  const normalizedNetworkEvents: NetworkEvents = {};

  for (const driver in networkEvents) {
    normalizedNetworkEvents[driver] = {
      transmitting: networkEvents[driver].transmitting.map((event) => ({
        start: normalizeTime(event.start),
        end: normalizeTime(event.end),
      })),
      receiving: networkEvents[driver].receiving.map((event) => ({
        start: normalizeTime(event.start),
        end: normalizeTime(event.end),
      })),
    };
  }

  return normalizedNetworkEvents;
}
