export interface LogEntry {
  timestamp: string;
  level: string;
  target: string;
  fields: {
    message: string;
    driver: string;
    json_packet?: string;
    rssi?: number;
    "time.busy": string;
    "time.idle": string;
  };
  span?: {
    driver: string;
    name: string;
    mavlink_frame?: string;
  };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  spans: any[];
}

export interface ChartPoint {
  x: string;
  y: number;
}
