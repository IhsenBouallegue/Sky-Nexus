import { TimeSeriesPoint } from "@/lib/analyzers/channel-activity-analyzer";
import { format, parseISO } from "date-fns";
import React from "react";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "./custom-tooltip";

interface ChartLine {
  dataKey: string; // Key in data object
  color: string; // Line color
  name: string; // Legend name
  dataPoints: TimeSeriesPoint[]; // Data points
  type?:
    | "monotone"
    | "natural"
    | "linear"
    | "step"
    | "stepAfter"
    | "stepBefore";
  dashed?: boolean;
}

export default function TimeSeriesChart({
  chartTitle,
  chartLines,
}: {
  chartTitle: string;
  chartLines: ChartLine[];
}) {
  // Create an object where each key is a timestamp and each value is an object
  // with keys for each data point and null for initial values
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const combinedData: { [key: string]: any } = {};

  // Populate the combinedData object with data points from all lines
  for (const line of chartLines) {
    if (line.dataPoints && line.dataPoints.length !== 0) {
      for (const point of line.dataPoints) {
        const formattedDate = format(
          parseISO(point.x.toISOString()),
          "HH:mm:ss"
        );
        if (!combinedData[formattedDate]) {
          combinedData[formattedDate] = { date: formattedDate };
          // Initialize all line dataKeys to null
          for (const otherLine of chartLines) {
            combinedData[formattedDate][otherLine.dataKey] = null;
          }
        }
        combinedData[formattedDate][line.dataKey] = point.y;
      }
    }
  }

  // Convert the combinedData object to an array for the chart
  const formattedData = Object.values(combinedData);

  return (
    <div className="flex flex-col w-full">
      <h3 className="text-2xl font-semibold mb-4 ml-6">{chartTitle}</h3>
      <ResponsiveContainer height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Legend />
          <Tooltip content={<CustomTooltip />} />

          <Brush
            dataKey="date"
            startIndex={0}
            height={30}
            fill="transparent"
            stroke="hsl(var(--foreground) / 40%)"
          />
          {chartLines.map((line) => (
            <Line
              key={line.name}
              type={line.type || "monotone"}
              dataKey={line.dataKey}
              stroke={line.color}
              name={line.name}
              strokeDasharray={line.dashed ? "3 3" : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
