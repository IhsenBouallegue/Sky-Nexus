import { TransmissionChartPoint } from "@/lib/logging-utils";
import React from "react";
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "./custom-tooltip";

export default function TransmissionBarChart({
  chartTitle,
  data,
}: {
  data: TransmissionChartPoint[];
  chartTitle: string;
}) {
  return (
    <div className="flex flex-col w-full">
      <h3 className="text-2xl font-semibold mb-4 ml-6">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Brush
            dataKey="date"
            startIndex={0}
            height={30}
            fill="transparent"
            stroke="hsl(var(--foreground) / 40%)"
          />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
