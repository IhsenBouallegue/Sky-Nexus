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

type payloadType = {
  value: string | number;
  name: string;
};
interface CustomTooltipProps {
  active?: boolean;
  payload?: payloadType[];
  label?: number;
}

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

  const CustomContent = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      return (
        <div
          style={{
            backgroundColor: "#5b63ffe7",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "1px 2px 10px -2px #7873ffb1",
          }}
        >
          {label}
          {payload.map((pld: payloadType) => (
            <p
              key={pld.name}
              style={{
                borderStyle: "solid 1px",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "sans-serif",
                color: "#fff",
              }}
            >
              {`${pld.name} : ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="flex flex-col w-full">
      <h3 className="text-2xl font-semibold mb-4 ml-6">{chartTitle}</h3>
      <ResponsiveContainer height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Legend />
          <Tooltip content={<CustomContent />} />
          <Brush
            dataKey="date"
            startIndex={0}
            height={30}
            fill="transparent"
            stroke="hsl(var(--foreground) / 40%)"
          />
          <Line type="monotone" dataKey="sent" stroke="#22a6b3" />
          <Line type="monotone" dataKey="received" stroke="#f0932b" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
