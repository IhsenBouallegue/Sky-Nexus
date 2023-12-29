import { DataPoint } from "@/lib/logging-utils";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TimeSeriesChart({
  sentData,
  receivedData,
}: { sentData: DataPoint[]; receivedData: DataPoint[] }) {
  const data = sentData.map((d, index) => ({
    name: d.x,
    Sent: d.y,
    Received: receivedData[index] ? receivedData[index].y : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Sent" stroke="blue" />
        <Line type="monotone" dataKey="Received" stroke="red" />
      </LineChart>
    </ResponsiveContainer>
  );
}
