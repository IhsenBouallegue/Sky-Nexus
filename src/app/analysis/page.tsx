"use client";

import AnalysisBarChart from "@/components/bar-chart";
import LogEntriesDataTable from "@/components/data-table";
import { columns } from "@/components/data-table/columns";
import GanttChart from "@/components/gantt-chart";
import Title from "@/components/title";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RECEIVE_PACKET_MSG, SEND_PACKET_MSG } from "@/lib/events";
import { ChartPoint } from "@/lib/logging-utils";
import { useAnalysisStore } from "@/lib/store";
import { XIcon } from "lucide-react";
import FileUploader from "../../components/file-uploader";
import TimeSeriesChart from "../../components/timeseries-chart";

export default function Page() {
  const { removeDataSource, results, analyzers } = useAnalysisStore(
    (state) => ({
      addDataSource: state.addDataSource,
      updateLogEntry: state.updateLogEntry,
      removeDataSource: state.removeDataSource,
      results: state.results,
      analyzers: state.analyzers,
    })
  );

  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Log Event Analysis</Title>
      <Tabs defaultValue="account">
        <div className="flex justify-between w-full gap-4">
          <TabsList className="w-full justify-start">
            {Object.keys(results).map((sourceId) => (
              <TabsTrigger key={sourceId} value={sourceId}>
                {sourceId}
                <Button
                  onClick={() => removeDataSource(sourceId)}
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
          </div>
        </div>
        {Object.entries(results).map(([sourceId, analysisResults]) => (
          <TabsContent key={sourceId} value={sourceId}>
            <div className="flex flex-col gap-12">
              {/* Channel Activity */}
              <div className="flex gap-12 min-w-fit">
                {Object.entries(analysisResults.channelActivity || {}).map(
                  ([driver, data]) => (
                    <TimeSeriesChart
                      key={driver}
                      chartTitle={`Channels: ${driver} <-> Main`}
                      chartLines={[
                        {
                          dataKey: "sentMessages",
                          dataPoints: data.sentMessages,
                          color: "#f0932b",
                          name: `${driver} -> Main`,
                        },
                        {
                          dataKey: "receivedMessages",
                          dataPoints: data.receivedMessages,
                          color: "#22a6b3",
                          name: `${driver} <- Main`,
                        },
                        // {
                        //   dataKey: "transmissions",
                        //   dataPoints: transmissionCounts[logDataKey][driver],
                        //   color: "#6ab04c",
                        //   name: "Transmissions",
                        //   type: "linear",
                        //   dashed: true,
                        // },
                        // Transmission counts visualization can be added once implemented
                      ]}
                    />
                  )
                )}
              </div>

              {/* Event Counts */}
              <div className="flex gap-12 min-w-fit">
                {Object.entries(analysisResults.eventCounts || {}).map(
                  ([driver, data]) => (
                    <AnalysisBarChart
                      key={driver}
                      chartTitle={`${driver} Events Count`}
                      data={data}
                    />
                  )
                )}
              </div>

              {/* Message Types Received and Sent - Assuming these can now be directly accessed from results */}
              {[RECEIVE_PACKET_MSG, SEND_PACKET_MSG].map((event) => (
                <div className="flex gap-12 min-w-fit" key={event}>
                  {Object.entries(analysisResults.messageTypeCounts || {}).map(
                    ([driver, eventCounts]) => {
                      // Transform { [msgType: string]: number } to ChartPoint[]
                      const dataForEvent = eventCounts[event];
                      const chartData: ChartPoint[] = Object.entries(
                        dataForEvent || {}
                      ).map(([msgType, count]) => ({
                        x: msgType,
                        y: count,
                      }));

                      return (
                        <AnalysisBarChart
                          key={`${driver}-${event}`}
                          chartTitle={`${driver} Message Types ${
                            event === "RECEIVE_PACKET_MSG" ? "Received" : "Sent"
                          }`}
                          data={chartData} // Pass the transformed data here
                        />
                      );
                    }
                  )}
                </div>
              ))}

              {/* Network Timeline */}
              <div className="ml-6">
                <h3 className="text-2xl font-semibold mb-8">
                  Network Timeline
                </h3>
                <GanttChart spans={analysisResults.spans || {}} />
              </div>

              {/* Assuming logEntries are part of results for rendering in DataTable */}
              <LogEntriesDataTable
                data={analyzers[sourceId].getLogEntries()}
                columns={columns}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
