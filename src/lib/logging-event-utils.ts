// Helper function to parse duration strings (e.g., "56.1µs", "44.1ms") into milliseconds
export function parseDuration(durationStr: string): number {
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
