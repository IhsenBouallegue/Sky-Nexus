import AnalysisBarChart from "@/components/bar-chart";
import { AnalyzerKeys } from "@/lib/analyzers/unified-analyzer";
import { RECEIVE_PACKET_MSG } from "@/lib/events";
import { ChartPoint } from "@/lib/logging-utils";
import { NodeId, useAnalysisStore } from "@/lib/store";

export default function MessageTypes({ nodeId, event }: { nodeId: NodeId; event: string }) {
  const system = useAnalysisStore((state) => state.system);
  return (
    <div className="flex gap-12 min-w-fit" key={event}>
      {Object.entries(system.analyzer.getAnalyzerResult(AnalyzerKeys.MessageType)?.[nodeId] || {}).map(
        ([driver, eventCounts]) => {
          // Transform { [msgType: string]: number } to ChartPoint[]

          const dataForEvent = eventCounts[event];
          const chartData: ChartPoint[] = Object.entries(dataForEvent || {}).map(([msgType, count]) => ({
            x: msgType,
            y: count,
          }));
          return (
            <AnalysisBarChart
              key={`${driver}-${event}`}
              chartTitle={`${driver} Message Types ${event === RECEIVE_PACKET_MSG ? "Received" : "Sent"}`}
              data={chartData} // Pass the transformed data here
            />
          );
        }
      )}
    </div>
  );
}
