"use client";

import { columns } from "@/components/data-table/columns";
import Title from "@/components/title";
import {
  ChartPoint,
  DataPoint,
  LogEntry,
  countLogEvents,
  processData,
  processDataForBarChart,
} from "@/lib/logging-utils";
import { useState } from "react";

import AnalysisBarChart from "@/components/bar-chart";
import LogEntriesDataTable from "@/components/data-table";
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
  const [udpTransmissions, setUdpTransmissions] = useState<ChartPoint[]>([]);
  const [loraTransmissions, setLoraTransmissions] = useState<ChartPoint[]>([]);
  const [eventsCount, setEventsCount] = useState<Record<string, ChartPoint[]>>(
    {}
  );
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
    const eventsCount = countLogEvents(logData);
    setEventsCount(eventsCount);
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
          <AnalysisBarChart
            chartTitle="UDP Transmissions"
            data={udpTransmissions}
          />
          <AnalysisBarChart
            chartTitle="LoRa Transmissions"
            data={loraTransmissions}
          />
        </div>
        <div className="flex gap-12 min-w-fit">
          <AnalysisBarChart
            chartTitle="UDP Events Count"
            data={eventsCount.udp_driver}
          />
          <AnalysisBarChart
            chartTitle="LoRa Events Count"
            data={eventsCount.lora_driver}
          />
        </div>

        <LogEntriesDataTable data={logData} columns={columns} />
      </div>
    </div>
  );
}
