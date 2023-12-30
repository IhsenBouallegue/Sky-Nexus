"use client";

import TransmissionBarChart from "@/components/bar-chart";
import { columns } from "@/components/columns";
import { LogEntriesDataTable } from "@/components/data-table";
import Title from "@/components/title";
import {
  DataPoint,
  LogEntry,
  TransmissionChartPoint,
  processData,
  processDataForBarChart,
} from "@/lib/logging-utils";

import { useState } from "react";
import FileUploader from "../../components/file-uploader";
import TimeSeriesChart from "../../components/timeseries-chart";

export default function Page() {
  const [chartData, setChartData] = useState<{
    sent: DataPoint[];
    received: DataPoint[];
  }>({ sent: [], received: [] });
  const [chart2Data, setChart2Data] = useState<{
    sent: DataPoint[];
    received: DataPoint[];
  }>({ sent: [], received: [] });
  const [udpTransmissions, setUdpTransmissions] = useState<
    TransmissionChartPoint[]
  >([]);
  const [loraTransmissions, setLoraTransmissions] = useState<
    TransmissionChartPoint[]
  >([]);
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const handleFileLoad = (logData: LogEntry[]) => {
    setLogData(logData);
    const { sentData, receivedData } = processData(logData, "udp_driver");
    setChartData({ sent: sentData, received: receivedData });
    const { sentData: sentLora, receivedData: receivedLora } = processData(
      logData,
      "lora_driver"
    );
    setChart2Data({ sent: sentLora, received: receivedLora });
    const udpTransmissions = processDataForBarChart(logData, "udp_driver");
    setUdpTransmissions(udpTransmissions);
    const loraTransmissions = processDataForBarChart(logData, "lora_driver");
    setLoraTransmissions(loraTransmissions);
  };

  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Log Event Analysis</Title>
      <div className="flex flex-col gap-12">
        <FileUploader onFileLoad={handleFileLoad} />
        <div className="flex gap-12 min-w-fit">
          <TimeSeriesChart
            chartTitle="Channels: UDP Network to Main"
            sentData={chartData.sent}
            receivedData={chartData.received}
          />
          <TimeSeriesChart
            chartTitle="Channels: LoRa Network to Main"
            sentData={chart2Data.sent}
            receivedData={chart2Data.received}
          />
        </div>
        <div className="flex gap-12 min-w-fit">
          <TransmissionBarChart
            chartTitle="UDP Transmissions"
            data={udpTransmissions}
          />
          <TransmissionBarChart
            chartTitle="LoRa Transmissions"
            data={loraTransmissions}
          />
        </div>
        <LogEntriesDataTable data={logData} columns={columns} />
      </div>
    </div>
  );
}
