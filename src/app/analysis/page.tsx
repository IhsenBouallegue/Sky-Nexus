"use client";

import { columns } from "@/components/data-table/columns";
import Title from "@/components/title";
import {
  ChannelActivityRecord,
  analyzeChannelActivity,
  countLogEvents,
  countMessageTypes,
} from "@/lib/logging-utils";
import { useEffect, useState } from "react";

import AnalysisBarChart from "@/components/bar-chart";
import LogEntriesDataTable from "@/components/data-table";
import NetworkTimeline from "@/components/network-timeline";
import { countTransmissionsPerSecond } from "@/lib/logging-transmissions";
import { useAnalysisStore } from "@/lib/store";
import FileUploader from "../../components/file-uploader";
import TimeSeriesChart from "../../components/timeseries-chart";

export default function Page() {
  const logEntries = useAnalysisStore((state) => state.logEntries);
  const [channelActivity, setChannelActivity] = useState<ChannelActivityRecord>(
    {}
  );

  useEffect(() => {
    setChannelActivity(analyzeChannelActivity(logEntries));
  }, [logEntries]);

  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Log Event Analysis</Title>
      <div className="flex flex-col gap-12">
        <FileUploader />
        <div className="flex gap-12 min-w-fit">
          {channelActivity.udp_driver && (
            <TimeSeriesChart
              chartTitle="Channels: UDP Network <-> Main"
              chartLines={[
                {
                  dataKey: "sentMessages",
                  dataPoints: channelActivity.udp_driver.sentMessages,
                  color: "#f0932b",
                  name: "UDP -> Main",
                },
                {
                  dataKey: "receivedMessages",
                  dataPoints: channelActivity.udp_driver.receivedMessages,
                  color: "#22a6b3",
                  name: "UDP <- Main",
                },
                {
                  dataKey: "transmissions",
                  dataPoints:
                    countTransmissionsPerSecond(logEntries).udp_driver,
                  color: "#6ab04c",
                  name: "Transmissions",
                  type: "linear",
                  dashed: true,
                },
              ]}
            />
          )}
          {channelActivity.lora_driver && (
            <TimeSeriesChart
              chartTitle="Channels: LoRa Network <-> Main"
              chartLines={[
                {
                  dataKey: "sentMessages",
                  dataPoints: channelActivity.lora_driver.sentMessages,
                  color: "#f0932b",
                  name: "LoRa -> Main",
                  type: "linear",
                },
                {
                  dataKey: "receivedMessages",
                  dataPoints: channelActivity.lora_driver.receivedMessages,
                  color: "#22a6b3",
                  name: "LoRa <- Main",
                  type: "linear",
                },
                {
                  dataKey: "transmissions",
                  dataPoints:
                    countTransmissionsPerSecond(logEntries).lora_driver,
                  color: "#6ab04c",
                  name: "Transmissions",
                  type: "linear",
                  dashed: true,
                },
              ]}
            />
          )}
        </div>
        {/* <div className="flex gap-12 min-w-fit">
          <AnalysisBarChart
            chartTitle="UDP Transmissions"
          data={udpTransmissions}
          />
          <AnalysisBarChart
            chartTitle="LoRa Transmissions"
            data={loraTransmissions}
          />
        </div> */}
        <div className="flex gap-12 min-w-fit">
          <AnalysisBarChart
            chartTitle="UDP Events Count"
            data={countLogEvents(logEntries).udp_driver}
          />
          <AnalysisBarChart
            chartTitle="LoRa Events Count"
            data={countLogEvents(logEntries).lora_driver}
          />
        </div>
        <div className="flex gap-12 min-w-fit">
          <AnalysisBarChart
            chartTitle="UDP Message Types Received"
            data={countMessageTypes(logEntries).udp_driver}
          />
          <AnalysisBarChart
            chartTitle="LoRa Message Types Received"
            data={countMessageTypes(logEntries).lora_driver}
          />
        </div>
        <div className="ml-6">
          <h3 className="text-2xl font-semibold mb-8">Network Timeline</h3>
          <NetworkTimeline logEntries={logEntries} />
        </div>
        <LogEntriesDataTable data={logEntries} columns={columns} />
      </div>
    </div>
  );
}
