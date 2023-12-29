"use client";

import Title from "@/components/title";
import { DataPoint, LogEntry, processData } from "@/lib/logging-utils";
import { useState } from "react";
import FileUploader from "../FileUploader";
import TimeSeriesChart from "../TimeSeriesChart";

export default function Page() {
  const [chartData, setChartData] = useState<{
    sent: DataPoint[];
    received: DataPoint[];
  }>({ sent: [], received: [] });
  const [chart2Data, setChart2Data] = useState<{
    sent: DataPoint[];
    received: DataPoint[];
  }>({ sent: [], received: [] });

  const handleFileLoad = (logData: LogEntry[]) => {
    const { sentData, receivedData } = processData(logData, "udp_driver");
    setChartData({ sent: sentData, received: receivedData });
    const { sentData: sentLora, receivedData: receivedLora } = processData(
      logData,
      "lora_driver"
    );
    setChart2Data({ sent: sentLora, received: receivedLora });
  };

  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Log Event Analysis</Title>
      <div className="flex flex-col gap-12">
        <FileUploader onFileLoad={handleFileLoad} />
        <div className="flex gap-12 min-w-fit">
          <TimeSeriesChart
            sentData={chartData.sent}
            receivedData={chartData.received}
          />
          <TimeSeriesChart
            sentData={chart2Data.sent}
            receivedData={chart2Data.received}
          />
        </div>
      </div>
    </div>
  );
}
