"use client";

import AnalysisBarChart from "@/components/bar-chart";
import LogEntriesDataTable from "@/components/data-table";
import { columns } from "@/components/data-table/columns";
import NetworkTimeline from "@/components/network-timeline";
import Title from "@/components/title";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RECEIVE_PACKET_MSG, SEND_PACKET_MSG } from "@/lib/events";
import { extractNetworkEventDurations } from "@/lib/logging-event-utils";
import { countTransmissionsPerSecond } from "@/lib/logging-transmissions";
import {
  LogEntry,
  analyzeChannelActivity,
  countLogEvents,
  countMessageTypes,
} from "@/lib/logging-utils";
import { useAnalysisStore } from "@/lib/store";
import { invoke } from "@tauri-apps/api";
import { Event, listen } from "@tauri-apps/api/event";
import { Plug2Icon, XIcon } from "lucide-react";
import { useEffect } from "react";
import FileUploader from "../../components/file-uploader";
import TimeSeriesChart from "../../components/timeseries-chart";

export default function Page() {
  const logData = useAnalysisStore((state) => state.logData);
  const removeLogEntries = useAnalysisStore((state) => state.removeLogEntries);
  const addLogEntriy = useAnalysisStore((state) => state.addLogEntry);

  useEffect(() => {
    const handleMessage = (event: Event<[string, string]>) => {
      const data = JSON.parse(event.payload[0]) as LogEntry;
      const addr = event.payload[1];
      addLogEntriy(addr, data);
    };
    const listener = listen("message", handleMessage);

    return () => {
      listener.then((unlisten) => unlisten());
    };
  }, [addLogEntriy]);
  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Log Event Analysis</Title>
      <Tabs defaultValue="account">
        <div className="flex justify-between w-full gap-4">
          <TabsList className="w-full justify-start">
            {Object.keys(logData).map((key) => (
              <TabsTrigger key={key} value={key}>
                {key}
                <Button
                  onClick={() => removeLogEntries(key)}
                  variant="destructive"
                  size="icon"
                  className="w-6 h-6 ml-2"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-4">
            <FileUploader />
            <Button onClick={() => invoke("connect")}>
              <Plug2Icon className="mr-2 h-4 w-4" /> Connect
            </Button>
          </div>
        </div>
        {Object.entries(logData).map(([key, logEntries]) => (
          <TabsContent key={key} value={key}>
            <div className="flex flex-col gap-12">
              <div className="flex gap-12 min-w-fit">
                <TimeSeriesChart
                  chartTitle="Channels: UDP Network <-> Main"
                  chartLines={[
                    {
                      dataKey: "sentMessages",
                      dataPoints:
                        analyzeChannelActivity(logEntries).udp_driver
                          ?.sentMessages,
                      color: "#f0932b",
                      name: "UDP -> Main",
                    },
                    {
                      dataKey: "receivedMessages",
                      dataPoints:
                        analyzeChannelActivity(logEntries).udp_driver
                          ?.receivedMessages,
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
                <TimeSeriesChart
                  chartTitle="Channels: LoRa Network <-> Main"
                  chartLines={[
                    {
                      dataKey: "sentMessages",
                      dataPoints:
                        analyzeChannelActivity(logEntries).lora_driver
                          ?.sentMessages,
                      color: "#f0932b",
                      name: "LoRa -> Main",
                      type: "linear",
                    },
                    {
                      dataKey: "receivedMessages",
                      dataPoints:
                        analyzeChannelActivity(logEntries).lora_driver
                          ?.receivedMessages,
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
              </div>
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
                  data={
                    countMessageTypes(logEntries, RECEIVE_PACKET_MSG).udp_driver
                  }
                />
                <AnalysisBarChart
                  chartTitle="LoRa Message Types Received"
                  data={
                    countMessageTypes(logEntries, RECEIVE_PACKET_MSG)
                      .lora_driver
                  }
                />
              </div>
              <div className="flex gap-12 min-w-fit">
                <AnalysisBarChart
                  chartTitle="UDP Message Types Sent"
                  data={
                    countMessageTypes(logEntries, SEND_PACKET_MSG).udp_driver
                  }
                />
                <AnalysisBarChart
                  chartTitle="LoRa Message Types Sent"
                  data={
                    countMessageTypes(logEntries, SEND_PACKET_MSG).lora_driver
                  }
                />
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-semibold mb-8">
                  Network Timeline
                </h3>
                <NetworkTimeline
                  rawNetworkEvents={extractNetworkEventDurations(logEntries)}
                  globalStart={Math.min(
                    ...logEntries.map((entry) =>
                      new Date(entry.timestamp).getTime()
                    )
                  )}
                  globalEnd={Math.max(
                    ...logEntries.map((entry) =>
                      new Date(entry.timestamp).getTime()
                    )
                  )}
                />
              </div>
              <LogEntriesDataTable data={logEntries} columns={columns} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
