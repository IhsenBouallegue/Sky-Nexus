import { DataPoint } from "@/lib/logging-utils";
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

export default function TimeSeriesChart({
  chartTitle,
  sentData,
  receivedData,
}: {
  chartTitle: string;
  sentData: DataPoint[];
  receivedData: DataPoint[];
}) {
  const data = sentData.map((d, index) => ({
    date: format(parseISO(d.x.toISOString()), "HH:mm:ss"),
    sent: d.y,
    received: receivedData[index] ? receivedData[index].y : null,
  }));

  return (
    <div className="flex flex-col w-full">
      <h3 className="text-2xl font-semibold mb-4 ml-6">{chartTitle}</h3>
      <ResponsiveContainer height={300}>
        <LineChart data={data}>
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
          <Line
            type="monotone"
            dataKey="sent"
            stroke="#22a6b3"
            name="sent to main"
          />
          <Line
            type="monotone"
            dataKey="received"
            stroke="#f0932b"
            name="received from main"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
